import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICertificate extends Document {
  certNo: string;
  type: string;
  studentId: string;
  studentName?: string;
  admissionNo?: string;
  className?: string;
  fatherName?: string;
  date: string;
  details: Record<string, any>;
  issuedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    certNo: { type: String, required: true, unique: true, uppercase: true },
    type: { type: String, required: true },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, default: "" },
    admissionNo: { type: String, default: "" },
    className: { type: String, default: "" },
    fatherName: { type: String, default: "" },
    date: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    details: { type: Schema.Types.Mixed, default: {} },
    issuedBy: { type: String, default: "Principal" },
  },
  { timestamps: true }
);

export const Certificate: Model<ICertificate> =
  mongoose.models.Certificate || mongoose.model<ICertificate>("Certificate", CertificateSchema);
