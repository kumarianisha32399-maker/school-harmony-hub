import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeacher extends Document {
  empId: string;
  name: string;
  fatherSpouse: string;
  dob: string;
  gender: string;
  mobile: string;
  email: string;
  address: string;
  qualification: string;
  subject: string;
  joiningDate: string;
  salary: number;
  photo: string;
  photoPublicId?: string;
  assignedClasses: string[];
  status: "Active" | "Inactive" | "Resigned";
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    empId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    fatherSpouse: { type: String, default: "", trim: true },
    dob: { type: String, default: "" },
    gender: { type: String, default: "Female" },
    mobile: { type: String, default: "", trim: true },
    email: { type: String, default: "", lowercase: true, trim: true },
    address: { type: String, default: "" },
    qualification: { type: String, default: "B.Ed" },
    subject: { type: String, default: "" },
    joiningDate: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    salary: { type: Number, default: 30000 },
    photo: { type: String, default: "" },
    photoPublicId: { type: String, default: "" },
    assignedClasses: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Resigned"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export const Teacher: Model<ITeacher> =
  mongoose.models.Teacher || mongoose.model<ITeacher>("Teacher", TeacherSchema);
