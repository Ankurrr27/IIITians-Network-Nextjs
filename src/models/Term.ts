import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITermDocument extends Document {
  name: string; // e.g. "2025-26"
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  metadata?: {
    theme?: string;
    goals?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const termSchema = new Schema<ITermDocument>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false },
    metadata: {
      theme: { type: String, trim: true },
      goals: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

const Term: Model<ITermDocument> =
  mongoose.models.Term || mongoose.model<ITermDocument>("Term", termSchema);

export default Term;
