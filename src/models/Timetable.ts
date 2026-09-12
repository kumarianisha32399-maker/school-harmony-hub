import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITimetable extends Document {
  className: string;
  section: string;
  day: string; // Monday, Tuesday, etc.
  period: number;
  subject: string;
  teacher: string;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date;
}

const TimetableSchema = new Schema<ITimetable>(
  {
    className: { type: String, required: true },
    section: { type: String, required: true },
    day: { type: String, required: true },
    period: { type: Number, required: true },
    subject: { type: String, required: true },
    teacher: { type: String, default: "" },
    startTime: { type: String, default: "09:00" },
    endTime: { type: String, default: "09:45" },
  },
  { timestamps: true }
);

TimetableSchema.index({ className: 1, section: 1, day: 1, period: 1 }, { unique: true });

export const Timetable: Model<ITimetable> =
  mongoose.models.Timetable || mongoose.model<ITimetable>("Timetable", TimetableSchema);
