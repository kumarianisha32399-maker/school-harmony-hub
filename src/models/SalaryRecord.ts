import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISalaryRecord extends Document {
  empId: string;
  name: string;
  role: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  advance: number;
  netSalary: number;
  paymentDate: string;
  paymentMode: string;
  status: "Paid" | "Pending";
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SalaryRecordSchema = new Schema<ISalaryRecord>(
  {
    empId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    role: { type: String, default: "Teacher" },
    month: { type: String, required: true },
    year: { type: Number, default: () => new Date().getFullYear() },
    basicSalary: { type: Number, required: true, min: 0 },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    advance: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    paymentDate: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    paymentMode: { type: String, default: "Bank Transfer" },
    status: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Paid",
    },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

SalaryRecordSchema.index({ empId: 1, month: 1, year: 1 }, { unique: true });

export const SalaryRecord: Model<ISalaryRecord> =
  mongoose.models.SalaryRecord ||
  mongoose.model<ISalaryRecord>("SalaryRecord", SalaryRecordSchema);
