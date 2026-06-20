import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICommitteeDocument extends Document {
  name: string; // "Tech", "Design", "Core", "Content", "Social Media"
  description?: string;
  order: number;
  parentClub?: mongoose.Types.ObjectId; // Optional: If specific to a club
  createdAt?: Date;
  updatedAt?: Date;
}

const committeeSchema = new Schema<ICommitteeDocument>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true },
    order: { type: Number, default: 0 },
    parentClub: { type: Schema.Types.ObjectId, ref: "Club" },
  },
  { timestamps: true }
);

const Committee: Model<ICommitteeDocument> =
  mongoose.models.Committee || mongoose.model<ICommitteeDocument>("Committee", committeeSchema);

export default Committee;
