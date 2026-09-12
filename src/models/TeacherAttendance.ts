import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeacherAttendance extends Document {
  teacherId: string;
  teacherName?: string;
  date: string; // YYYY-MM-DD
  status: "Present" | "Absent" | "Late" | "Leave";
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherAttendanceSchema = new Schema<ITeacherAttendance>(
  {
    teacherId: { type: String, required: true, index: true },
    teacherName: { type: String, default: "" },
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

TeacherAttendanceSchema.index({ teacherId: 1, date: 1 }, { unique: true });

export const TeacherAttendance: Model<ITeacherAttendance> =
  mongoose.models.TeacherAttendance ||
  mongoose.model<ITeacherAttendance>("TeacherAttendance", TeacherAttendanceSchema);
