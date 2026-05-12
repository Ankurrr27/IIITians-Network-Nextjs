import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClubDocument extends Document {
  name: string;
  collegeId: mongoose.Types.ObjectId;
  logo: string;
  description?: string;
  leads?: mongoose.Types.ObjectId[];
  gallery?: string[];
  createdAt?: Date;
}

const clubSchema = new Schema<IClubDocument>(
  {
    name: { type: String, required: true, trim: true },
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
    logo: { type: String, required: true },
    description: { type: String, trim: true },
    leads: [{ type: Schema.Types.ObjectId, ref: "User" }],
    gallery: [{ type: String }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Club: Model<IClubDocument> =
  mongoose.models.Club || mongoose.model<IClubDocument>("Club", clubSchema);

export default Club;
