import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getSessionUserId } from "@/lib/auth";

export async function DELETE(request, { params }) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = params || {};
  if (!id) {
    return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
  }

  try {
    await dbConnect();

    // Pull the transaction with matching id from user's transactions array
    const result = await User.updateOne(
      { _id: userId },
      { $pull: { transactions: { id: id } } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "User or transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Transaction deleted successfully",
      id,
    });
  } catch (err) {
    console.error("Delete transaction error:", err);
    return NextResponse.json(
      { error: "Failed to delete transaction. Please try again." },
      { status: 500 }
    );
  }
}
