import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudent extends Document {
  admissionNo: string;
  name: string;
  father: string;
  mother: string;
  dob: string;
  gender: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  className: string;
  section: string;
  rollNo: number;
  admissionDate: string;
  session: string;
  category: string;
  bloodGroup: string;
  photo: string;
  photoPublicId?: string;
  guardian: string;
  occupation: string;
  previousSchool: string;
  status: "Active" | "Transferred" | "Left" | "Graduated";
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    admissionNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    father: { type: String, default: "", trim: true },
    mother: { type: String, default: "", trim: true },
    dob: { type: String, default: "" },
    gender: { type: String, default: "Male" },
    mobile: { type: String, default: "", trim: true },
    email: { type: String, default: "", lowercase: true, trim: true },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pin: { type: String, default: "" },
    className: { type: String, required: true },
    section: { type: String, required: true },
    rollNo: { type: Number, default: 0 },
    admissionDate: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    session: { type: String, default: "2025-26" },
    category: { type: String, default: "General" },
    bloodGroup: { type: String, default: "" },
    photo: { type: String, default: "" },
    photoPublicId: { type: String, default: "" },
    guardian: { type: String, default: "" },
    occupation: { type: String, default: "" },
    previousSchool: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Active", "Transferred", "Left", "Graduated"],
      default: "Active",
    },
  },
  { timestamps: true }
);

StudentSchema.index({ name: "text", admissionNo: "text", mobile: "text", father: "text" });

export const Student: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);
