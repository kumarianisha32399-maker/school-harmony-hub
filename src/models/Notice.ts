import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotice extends Document {
  title: string;
  description: string;
  date: string;
  audience: "All" | "Teachers" | "Students" | "Parents";
  published: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    audience: {
      type: String,
      enum: ["All", "Teachers", "Students", "Parents"],
      default: "All",
    },
    published: { type: Boolean, default: true },
    createdBy: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

export const Notice: Model<INotice> =
  mongoose.models.Notice || mongoose.model<INotice>("Notice", NoticeSchema);
