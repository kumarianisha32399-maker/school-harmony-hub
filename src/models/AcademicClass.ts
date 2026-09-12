import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAcademicClass extends Document {
  name: string;
  order: number;
  sections: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AcademicClassSchema = new Schema<IAcademicClass>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    order: { type: Number, default: 0 },
    sections: { type: [String], default: ["A", "B", "C"] },
  },
  { timestamps: true }
);

export const AcademicClass: Model<IAcademicClass> =
  mongoose.models.AcademicClass ||
  mongoose.model<IAcademicClass>("AcademicClass", AcademicClassSchema);
