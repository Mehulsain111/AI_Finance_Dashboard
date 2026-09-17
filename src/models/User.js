import mongoose from "mongoose";
import { DEFAULT_TRANSACTIONS } from "@/data/transactions";

const TransactionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    date: { type: String, required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: { type: String, required: true },
    profileImageUrl: { type: String, default: "" },
    role: { type: String, enum: ["viewer", "admin"], default: "viewer" },
    darkMode: { type: Boolean, default: false },
    financialGoal: { type: String, default: "Wealth Growth", trim: true },
    monthlyIncome: { type: Number, default: 0, min: 0 },
    // Embedded, not a separate collection: the dashboard always reads and
    // writes the whole list together (there's no per-transaction API on the
    // frontend), so this mirrors the original localStorage shape closely.
    // A separate `Transaction` collection with a `userId` ref would be the
    // next step if this ever needs to scale past a personal finance demo.
    transactions: {
      type: [TransactionSchema],
      default: () => DEFAULT_TRANSACTIONS,
    },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
