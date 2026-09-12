import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMark extends Document {
  examId: string;
  studentId: string;
  studentName?: string;
  className?: string;
  subject: string;
  maxMarks: number;
  obtainedMarks: number;
  grade: string;
  createdAt: Date;
  updatedAt: Date;
}

const MarkSchema = new Schema<IMark>(
  {
    examId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, default: "" },
    className: { type: String, default: "" },
    subject: { type: String, required: true },
    maxMarks: { type: Number, default: 100 },
    obtainedMarks: { type: Number, required: true, min: 0 },
    grade: { type: String, default: "A" },
  },
  { timestamps: true }
);

MarkSchema.index({ examId: 1, studentId: 1, subject: 1 }, { unique: true });

export const Mark: Model<IMark> =
  mongoose.models.Mark || mongoose.model<IMark>("Mark", MarkSchema);
