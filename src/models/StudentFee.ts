import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFeeItem {
  head: string;
  amount: number;
}

export interface IStudentFee extends Document {
  invoiceNo: string;
  studentId: string;
  studentName?: string;
  className?: string;
  section?: string;
  admissionNo?: string;
  month: string;
  session: string;
  items: IFeeItem[];
  lateFee: number;
  discount: number;
  total: number;
  paid: number;
  pending: number;
  status: "Paid" | "Partial" | "Pending";
  dueDate: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentFeeSchema = new Schema<IStudentFee>(
  {
    invoiceNo: { type: String, required: true, unique: true, uppercase: true },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, default: "" },
    className: { type: String, default: "" },
    section: { type: String, default: "" },
    admissionNo: { type: String, default: "" },
    month: { type: String, required: true },
    session: { type: String, default: "2025-26" },
    items: [
      {
        head: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
      },
    ],
    lateFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true, default: 0 },
    paid: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Paid", "Partial", "Pending"],
      default: "Pending",
    },
    dueDate: { type: String, default: "" },
  },
  { timestamps: true }
);

StudentFeeSchema.index({ studentId: 1, month: 1, session: 1 });

export const StudentFee: Model<IStudentFee> =
  mongoose.models.StudentFee || mongoose.model<IStudentFee>("StudentFee", StudentFeeSchema);
