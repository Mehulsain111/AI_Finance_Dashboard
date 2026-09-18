// app/api/gemini/route.js

import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";

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

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action = "advisor", financialData, query = "" } = body;

  if (action !== "categorize" && (!Array.isArray(financialData) || financialData.length === 0)) {
    return NextResponse.json(
      { error: "financialData must be a non-empty array for analysis" },
      { status: 400 },
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    let response;
    
    // Helper to retry and fallback through available models on 503 or 429
    const FALLBACK_MODELS = [
      "gemini-3.5-flash-lite", 
      "gemini-3.5-flash-lite",
      "gemini-3.5-flash-lite",
      "gemini-3.5-flash-lite",
      "gemini-3.5-flash-lite"
    ];

    async function generateWithRetry(options) {
      let lastError;
      for (const model of FALLBACK_MODELS) {
        options.model = model;
        try {
          return await ai.models.generateContent(options);
        } catch (err) {
          const isOverloaded = err.status === 503 || err.message?.includes("fetch failed") || err.cause?.code === 'UND_ERR_HEADERS_TIMEOUT';
          const isRateLimited = err.status === 429;
          
          if (isOverloaded || isRateLimited) {
            console.log(`Gemini ${err.status || 'TIMEOUT'} on ${model}. Falling back to next...`);
            lastError = err;
            // Slightly pause on 503 overload before hammering the next model
            if (isOverloaded) await new Promise(r => setTimeout(r, 500));
            continue;
          }
          throw err;
        }
      }
      throw lastError; // Throw if all models in the array are exhausted
    }
    
    // Switch on the action type
    switch (action) {
      case "advisor": {
        const prompt = `I am providing you with the user's raw financial data in JSON format: ${JSON.stringify(financialData)}. Analyze this data and provide exactly 3 short, highly personalized, and actionable saving recommendations. Highlight the biggest area of overspending. Return the response in clean markdown format.`;
        response = await generateWithRetry({
          model: "gemini-3.5-flash-lite",
          contents: prompt,
          config: { systemInstruction: "You are an expert financial advisor." },
        });
        return NextResponse.json({ result: response.text });
      }

      case "forecast": {
        // Output structured data: array of monthly projections
        const prompt = `Based on the following transaction history: ${JSON.stringify(financialData)}, project the user's total balance for the next 6 months. Take into account their average monthly income and expenses. Return a realistic projection.`;
        response = await generateWithRetry({
          model: "gemini-3.5-flash-lite",
          contents: prompt,
          config: {
            systemInstruction: "You are a quantitative financial analyst. Produce realistic wealth forecasts.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  month: { type: Type.STRING, description: "Month name, e.g., 'Oct'" },
                  projectedBalance: { type: Type.NUMBER, description: "The expected balance" },
                  bestCase: { type: Type.NUMBER, description: "Optimistic projection" },
                  worstCase: { type: Type.NUMBER, description: "Pessimistic projection" }
                },
                required: ["month", "projectedBalance", "bestCase", "worstCase"]
              }
            }
          }
        });
        return NextResponse.json({ result: JSON.parse(response.text) });
      }

      case "query": {
        // NLP Expense Querying
        const prompt = `User query: "${query}". Based on this transaction history: ${JSON.stringify(financialData)}, answer the query concisely. In your response, include a natural language answer, and if applicable, an array of the transaction IDs that match the query so we can highlight them.`;
        response = await generateWithRetry({
          model: "gemini-3.5-flash-lite",
          contents: prompt,
          config: {
            systemInstruction: "You are a helpful financial assistant answering questions about user transactions.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                answer: { type: Type.STRING, description: "Natural language answer" },
                matchedTransactionIds: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "IDs of transactions matching the query, if any."
                }
              },
              required: ["answer", "matchedTransactionIds"]
            }
          }
        });
        return NextResponse.json({ result: JSON.parse(response.text) });
      }

      case "risk": {
        const prompt = `Analyze this transaction history for risks, subscription traps, or unusual spending: ${JSON.stringify(financialData)}. Provide an overall health score (0-100) and list specific alerts.`;
        response = await generateWithRetry({
          model: "gemini-3.5-flash-lite",
          contents: prompt,
          config: {
            systemInstruction: "You are an automated risk and anomaly detection system for personal finance.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                healthScore: { type: Type.INTEGER, description: "Score from 0 to 100" },
                alerts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      severity: { type: Type.STRING, enum: ["low", "medium", "high"] }
                    },
                    required: ["title", "description", "severity"]
                  }
                }
              },
              required: ["healthScore", "alerts"]
            }
          }
        });
        return NextResponse.json({ result: JSON.parse(response.text) });
      }

      case "categorize": {
        const { description } = body;
        const prompt = `Given the transaction description "${description}", suggest a category (e.g., Groceries, Utilities, Entertainment, Dining, Transportation, Health, Income) and whether it's likely an 'income' or 'expense'.`;
        response = await generateWithRetry({
          model: "gemini-3.5-flash-lite",
          contents: prompt,
          config: {
            systemInstruction: "You categorize transactions automatically.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["income", "expense"] }
              },
              required: ["category", "type"]
            }
          }
        });
        return NextResponse.json({ result: JSON.parse(response.text) });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

  } catch (err) {
    console.error("Gemini proxy error:", err);
    let msg = "Upstream Gemini request failed";
    if (err.status === 503 || err.message?.includes("fetch failed")) msg = "Gemini API is temporarily overloaded (503/Timeout). Please try again in a few seconds.";
    if (err.status === 429) msg = "Gemini free tier daily quota exceeded for all models (429). Please try again later.";
    
    return NextResponse.json(
      { error: msg },
      { status: 502 },
    );
  }
}
