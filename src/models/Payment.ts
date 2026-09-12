import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayment extends Document {
  receiptNo: string;
  invoiceId?: string;
  studentId: string;
  studentName?: string;
  admissionNo?: string;
  className?: string;
  amount: number;
  date: string;
  mode: "Cash" | "UPI" | "Card" | "Bank Transfer" | "Cheque" | "Razorpay";
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: "Success" | "Pending" | "Failed";
  collectedBy?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    receiptNo: { type: String, required: true, unique: true, uppercase: true },
    invoiceId: { type: String, default: "" },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, default: "" },
    admissionNo: { type: String, default: "" },
    className: { type: String, default: "" },
    amount: { type: Number, required: true, min: 1 },
    date: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    mode: {
      type: String,
      enum: ["Cash", "UPI", "Card", "Bank Transfer", "Cheque", "Razorpay"],
      default: "Cash",
    },
    transactionId: { type: String, default: "" },
    razorpayOrderId: { type: String, default: "", index: true },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Success", "Pending", "Failed"],
      default: "Success",
    },
    collectedBy: { type: String, default: "Admin" },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

// Sparse unique index on razorpayPaymentId to ensure strict idempotency for online payments
PaymentSchema.index(
  { razorpayPaymentId: 1 },
  { unique: true, partialFilterExpression: { razorpayPaymentId: { $type: "string", $gt: "" } } }
);

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
