import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUdiseStudent extends Document {
  admissionNo: string;
  className: string;
  section: string;
  name: string;
  gender: string;
  penNo: string;
  studentStateCode: string;
  dob: string;
  father: string;
  mother: string;
  socialCategory: string;
  minorityGroup: string;
  bplBeneficiary: string;
  cwsn: string;
  isRepeater: string;
  entryStatus: string;
  aadhaarNo: string;
  nameAsPerAadhaar: string;
  aadhaarValidationStatus: string;
  mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pin?: string;
  rollNo?: number;
  importedToStudents: boolean;
  importedToStudentsAt?: Date;
  importBatchId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UdiseStudentSchema = new Schema<IUdiseStudent>(
  {
    admissionNo: { type: String, default: "", trim: true },
    className: { type: String, required: true, trim: true },
    section: { type: String, default: "A", trim: true },
    name: { type: String, required: true, trim: true },
    gender: { type: String, default: "Male" },
    penNo: { type: String, default: "", trim: true },
    studentStateCode: { type: String, default: "", trim: true },
    dob: { type: String, default: "" },
    father: { type: String, default: "", trim: true },
    mother: { type: String, default: "", trim: true },
    socialCategory: { type: String, default: "General", trim: true },
    minorityGroup: { type: String, default: "None", trim: true },
    bplBeneficiary: { type: String, default: "No", trim: true },
    cwsn: { type: String, default: "No", trim: true },
    isRepeater: { type: String, default: "No", trim: true },
    entryStatus: { type: String, default: "Regular", trim: true },
    aadhaarNo: { type: String, default: "", trim: true },
    nameAsPerAadhaar: { type: String, default: "", trim: true },
    aadhaarValidationStatus: { type: String, default: "Pending", trim: true },
    mobile: { type: String, default: "", trim: true },
    email: { type: String, default: "", lowercase: true, trim: true },
    address: { type: String, default: "" },
    city: { type: String, default: "Indore" },
    state: { type: String, default: "Madhya Pradesh" },
    pin: { type: String, default: "" },
    rollNo: { type: Number, default: 0 },
    importedToStudents: { type: Boolean, default: false },
    importedToStudentsAt: { type: Date },
    importBatchId: { type: String, default: "" },
  },
  { timestamps: true }
);

UdiseStudentSchema.index({ name: "text", admissionNo: "text", penNo: "text", aadhaarNo: "text" });

export const UdiseStudent: Model<IUdiseStudent> =
  mongoose.models.UdiseStudent || mongoose.model<IUdiseStudent>("UdiseStudent", UdiseStudentSchema);
