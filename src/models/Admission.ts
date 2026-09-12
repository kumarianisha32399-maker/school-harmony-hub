import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdmission extends Document {
  regNo: string;
  name: string;
  father: string;
  mother: string;
  dob: string;
  gender: string;
  mobile: string;
  email: string;
  address: string;
  applyingClass: string;
  previousSchool: string;
  session: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
  fee: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdmissionSchema = new Schema<IAdmission>(
  {
    regNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    father: { type: String, default: "", trim: true },
    mother: { type: String, default: "", trim: true },
    dob: { type: String, default: "" },
    gender: { type: String, default: "Male" },
    mobile: { type: String, default: "", trim: true },
    email: { type: String, default: "", lowercase: true, trim: true },
    address: { type: String, default: "" },
    applyingClass: { type: String, required: true },
    previousSchool: { type: String, default: "" },
    session: { type: String, default: "2025-26" },
    date: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    fee: { type: Number, default: 5000 },
  },
  { timestamps: true }
);

export const Admission: Model<IAdmission> =
  mongoose.models.Admission || mongoose.model<IAdmission>("Admission", AdmissionSchema);
