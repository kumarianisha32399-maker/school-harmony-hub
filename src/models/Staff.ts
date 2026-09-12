import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStaff extends Document {
  empId: string;
  name: string;
  designation: string;
  department: string;
  mobile: string;
  email: string;
  joiningDate: string;
  salary: number;
  bankDetails: string;
  status: "Active" | "Inactive" | "Resigned";
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema = new Schema<IStaff>(
  {
    empId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    designation: { type: String, default: "Clerk" },
    department: { type: String, default: "Administration" },
    mobile: { type: String, default: "", trim: true },
    email: { type: String, default: "", lowercase: true, trim: true },
    joiningDate: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    salary: { type: Number, default: 20000 },
    bankDetails: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Resigned"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export const Staff: Model<IStaff> =
  mongoose.models.Staff || mongoose.model<IStaff>("Staff", StaffSchema);
