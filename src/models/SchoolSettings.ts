import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISchoolSettings extends Document {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  affiliation: string;
  code: string;
  principal: string;
  session: string;
  logo: string;
  logoPublicId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SchoolSettingsSchema = new Schema<ISchoolSettings>(
  {
    name: { type: String, default: "Harmony Public School" },
    tagline: { type: String, default: "Knowledge • Discipline • Excellence" },
    address: { type: String, default: "18 Ring Road, Vijay Nagar, Indore, Madhya Pradesh 452010" },
    phone: { type: String, default: "+91 731 400 1180" },
    email: { type: String, default: "office@harmonyschool.edu.in" },
    website: { type: String, default: "www.harmonyschool.edu.in" },
    affiliation: { type: String, default: "CBSE Affiliation No. 1030412" },
    code: { type: String, default: "HPS-1042" },
    principal: { type: String, default: "Dr. Neelam Saxena" },
    session: { type: String, default: "2025-26" },
    logo: { type: String, default: "" },
    logoPublicId: { type: String, default: "" },
  },
  { timestamps: true }
);

export const SchoolSettings: Model<ISchoolSettings> =
  mongoose.models.SchoolSettings ||
  mongoose.model<ISchoolSettings>("SchoolSettings", SchoolSettingsSchema);
