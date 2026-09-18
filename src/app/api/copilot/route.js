import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { getSessionUserId } from "@/lib/auth";

export async function POST(request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { history, financialData, userProfile } = await request.json();

    if (!history || !Array.isArray(history)) {
      return NextResponse.json({ error: "Missing or invalid history" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set" },
        { status: 500 },
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const tools = [{
      functionDeclarations: [
        {
          name: "add_transaction",
          description: "Add a new financial transaction (income or expense). Use this when the user says they bought something, earned money, or wants to log an expense.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
              type: { type: Type.STRING, description: "Must be exactly 'income' or 'expense'" },
              category: { type: Type.STRING, description: "Category or description, e.g. Groceries, Salary, Rent" },
              amount: { type: Type.NUMBER, description: "The amount as a positive number" }
            },
            required: ["date", "type", "category", "amount"]
          }
        },
        {
          name: "delete_transaction",
          description: "Delete an existing transaction using its unique ID.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "The unique ID of the transaction to delete" }
            },
            required: ["id"]
          }
        },
        {
          name: "update_profile",
          description: "Update the user's financial profile, such as their financial goal or monthly income.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              financialGoal: { type: Type.STRING, description: "The user's new financial goal, e.g. 'Buy a house', 'Save for retirement'" },
              monthlyIncome: { type: Type.NUMBER, description: "The user's new monthly income as a positive number" }
            }
          }
        }
      ]
    }];

    const systemInstruction = `You are a highly capable Autonomous Financial Copilot.
You help the user manage their finances, understand their spending, and update their dashboard.
You have access to the user's transaction data and profile, and you can execute tools to make changes on their behalf.
When a user asks you to add an expense or update their goal, use the provided tools.
If you need more information to execute a tool (e.g. they didn't provide a date or amount), ask them for it. Default to today's date if not specified.

Current User Profile:
- Name: ${userProfile?.name}
- Financial Goal: ${userProfile?.financialGoal || "Not set"}
- Monthly Income: ${userProfile?.monthlyIncome || 0}

Current Financial Data:
${JSON.stringify(financialData, null, 2)}
`;

    // History contains objects in the format:
    // { role: "user" | "model" | "function", parts: [{ text: "..." }, { functionCall: {...} }, { functionResponse: {...} }] }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: history,
      config: {
        systemInstruction: systemInstruction,
        tools: tools,
        temperature: 0.2, // Low temperature for reliable tool calling
      }
    });

    const candidate = response.candidates?.[0];
    if (!candidate) {
      return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
    }

    const newParts = candidate.content.parts;
    
    // Check if the response contains function calls
    const functionCalls = newParts.filter(p => p.functionCall).map(p => p.functionCall);
    const textPart = newParts.find(p => p.text)?.text || "";

    return NextResponse.json({
      result: {
        text: textPart,
        functionCalls: functionCalls.length > 0 ? functionCalls : undefined
      }
    });
  } catch (error) {
    console.error("Copilot API error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while processing the request" },
      { status: 500 },
    );
  }
}
