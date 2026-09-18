import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getSessionUserId, updateThemeCookie } from "@/lib/auth";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    await dbConnect();
    const user = await User.findById(userId).select("role darkMode transactions startingBalance");
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json({
      role: user.role,
      darkMode: user.darkMode,
      transactions: user.transactions,
      startingBalance: user.startingBalance ?? 12000,
    });
  } catch (err) {
    console.error("Fetch dashboard data error:", err);
    return NextResponse.json({ error: "Something went wrong. Check the server terminal for details." }, { status: 500 });
  }
}

export async function PUT(request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Only ever update fields that were actually sent, and only if they're
  // well-formed -- never trust the shape of the request body blindly.
  // SECURITY FIX: Removed `role` update to prevent privilege escalation (IDOR).
  const update = {};
  if (typeof body.darkMode === "boolean") update.darkMode = body.darkMode;
  if (typeof body.startingBalance === "number") update.startingBalance = body.startingBalance;
  if (Array.isArray(body.transactions)) {
    update.transactions = body.transactions
      .filter((t) => t && typeof t === "object")
      .map((t) => ({
        id: String(t.id ?? ""),
        date: String(t.date ?? ""),
        type: t.type === "income" ? "income" : "expense",
        category: String(t.category ?? "").trim(),
        amount: Number(t.amount) || 0,
      }));
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  try {
    await dbConnect();
    // findByIdAndUpdate (rather than loading + saving the document) keeps
    // this a single round trip and, more importantly, means concurrent
    // requests (e.g. a transaction save and a role change firing close
    // together) each patch only the fields they own instead of racing to
    // overwrite the whole document.
    await User.findByIdAndUpdate(userId, { $set: update });

    if ("darkMode" in update) {
      await updateThemeCookie(update.darkMode);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Save dashboard data error:", err);
    return NextResponse.json({ error: "Something went wrong. Check the server terminal for details." }, { status: 500 });
  }
}
