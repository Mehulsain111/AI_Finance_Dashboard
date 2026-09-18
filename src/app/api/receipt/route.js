import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getSessionUserId } from "@/lib/auth";

export async function POST(request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { imageBase64, mimeType } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set" },
        { status: 500 },
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Analyze this receipt or invoice and extract the following information. Return ONLY a valid JSON object matching this schema, without markdown formatting or other text:
{
  "date": "YYYY-MM-DD",
  "type": "expense" or "income",
  "category": "A short, descriptive category (e.g., Groceries, Office Supplies, Uber)",
  "amount": number
}

If any field is missing, guess the best possible value based on context, or leave empty if completely unsure.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: imageBase64,
                mimeType: mimeType || "image/jpeg",
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) {
      return NextResponse.json({ error: "Failed to extract data" }, { status: 500 });
    }

    // Parse the JSON response
    try {
      const result = JSON.parse(text);
      return NextResponse.json({ result });
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", text);
      return NextResponse.json({ error: "Invalid JSON from AI" }, { status: 500 });
    }
  } catch (error) {
    console.error("Receipt API error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while processing the receipt" },
      { status: 500 },
    );
  }
}
