// app/api/gemini/route.js
//
// Server-side proxy for the Gemini call, in App Router "Route Handler" form.
// This file is automatically exposed at POST /api/gemini -- no extra config
// needed. Converted from the old Vercel serverless function:
//   - `export default function handler(req, res)`  -->  `export async function POST(request)`
//   - `req.body` (pre-parsed)                       -->  `await request.json()`
//   - `res.status(n).json(obj)`                      -->  `NextResponse.json(obj, { status: n })`
//
// Set GEMINI_API_KEY in .env.local for local dev, and in your host's
// environment variables (e.g. Vercel Project Settings -> Environment
// Variables) for deployment. Do NOT prefix it with NEXT_PUBLIC_ -- that
// prefix is what tells Next.js to inline a variable into the public client
// bundle, which is exactly what we're avoiding here.

import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";

const SYSTEM_INSTRUCTION = "You are an expert financial advisor.";

export async function POST(request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing GEMINI_API_KEY" },
      { status: 500 },
    );
  }

  let financialData;
  try {
    ({ financialData } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(financialData) || financialData.length === 0) {
    return NextResponse.json(
      { error: "financialData must be a non-empty array" },
      { status: 400 },
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `I am providing you with the user's raw financial data in JSON format: ${JSON.stringify(
      financialData,
    )}. Analyze this data and provide exactly 3 short, highly personalized, and actionable saving recommendations. Highlight the biggest area of overspending. Return the response in clean markdown format.`;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION },
    });

    return NextResponse.json({ text: response.text });
  } catch (err) {
    console.error("Gemini proxy error:", err);
    return NextResponse.json(
      { error: "Upstream Gemini request failed" },
      { status: 502 },
    );
  }
}
