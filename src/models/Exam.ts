import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExamSubject {
  subject: string;
  date: string;
  startTime: string;
  maxMarks: number;
  passMarks: number;
}

export interface IExam extends Document {
  name: string;
  type: string;
  session: string;
  className: string;
  startDate: string;
  endDate: string;
  status: "Upcoming" | "Ongoing" | "Completed";
  subjects: IExamSubject[];
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema = new Schema<IExam>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, default: "Term" },
    session: { type: String, default: "2025-26" },
    className: { type: String, default: "All Classes" },
    startDate: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    endDate: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed"],
      default: "Upcoming",
    },
    subjects: [
      {
        subject: { type: String, required: true },
        date: { type: String, default: "" },
        startTime: { type: String, default: "09:00" },
        maxMarks: { type: Number, default: 100 },
        passMarks: { type: Number, default: 33 },
      },
    ],
  },
  { timestamps: true }
);

export const Exam: Model<IExam> =
  mongoose.models.Exam || mongoose.model<IExam>("Exam", ExamSchema);
