import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttendance extends Document {
  studentId: string;
  studentName?: string;
  className: string;
  section: string;
  date: string; // YYYY-MM-DD
  status: "Present" | "Absent" | "Late" | "Leave";
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, default: "" },
    className: { type: String, required: true, index: true },
    section: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Leave"],
      default: "Present",
    },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

// Compound unique index to prevent duplicate attendance for same student on same date
AttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

export const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);
