import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getSessionUserId } from "@/lib/auth";

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

  const update = {};
  if (typeof body.name === "string" && body.name.trim()) {
    update.name = body.name.trim();
  }
  if (typeof body.financialGoal === "string" && body.financialGoal.trim()) {
    update.financialGoal = body.financialGoal.trim();
  }
  if (typeof body.monthlyIncome === "number" && body.monthlyIncome >= 0) {
    update.monthlyIncome = body.monthlyIncome;
  } else if (typeof body.monthlyIncome === "string" && !isNaN(Number(body.monthlyIncome))) {
    update.monthlyIncome = Math.max(0, Number(body.monthlyIncome));
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid profile fields provided" }, { status: 400 });
  }

  try {
    await dbConnect();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        financialGoal: updatedUser.financialGoal,
        monthlyIncome: updatedUser.monthlyIncome,
        profileImageUrl: updatedUser.profileImageUrl,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
