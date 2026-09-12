import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFeeHead {
  head: string;
  amount: number;
  frequency: "Monthly" | "Quarterly" | "Annual" | "One-time";
}

export interface IFeeStructure extends Document {
  className: string;
  session: string;
  heads: IFeeHead[];
  totalAnnual: number;
  createdAt: Date;
  updatedAt: Date;
}

const FeeStructureSchema = new Schema<IFeeStructure>(
  {
    className: { type: String, required: true, index: true },
    session: { type: String, default: "2025-26", index: true },
    heads: [
      {
        head: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
        frequency: {
          type: String,
          enum: ["Monthly", "Quarterly", "Annual", "One-time"],
          default: "Monthly",
        },
      },
    ],
    totalAnnual: { type: Number, default: 0 },
  },
  { timestamps: true }
);

FeeStructureSchema.index({ className: 1, session: 1 }, { unique: true });

export const FeeStructure: Model<IFeeStructure> =
  mongoose.models.FeeStructure || mongoose.model<IFeeStructure>("FeeStructure", FeeStructureSchema);
