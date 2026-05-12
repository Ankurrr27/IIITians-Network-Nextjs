import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICollegeDocument extends Document {
  name: string;
  photo?: { public_id?: string; url?: string };
  logo?: { public_id?: string; url?: string };
  description?: string;
  website?: string;
  clubLink?: string;
  clubLinks?: { name: string; url: string }[];
  gallery?: {
    public_id?: string;
    url: string;
    caption?: string;
    category?: "infrastructure" | "clubs" | "events" | "others";
    createdAt?: Date;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const collegeSchema = new Schema<ICollegeDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    photo: { public_id: String, url: String },
    logo: { public_id: String, url: String },
    description: { type: String, trim: true },
    website: { type: String, trim: true },
    clubLink: { type: String, trim: true },
    clubLinks: [{ name: { type: String, trim: true }, url: { type: String, trim: true } }],
    gallery: [
      {
        public_id: String,
        url: String,
        caption: String,
        category: { type: String, enum: ["infrastructure", "clubs", "events", "others"] },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const College: Model<ICollegeDocument> =
  mongoose.models.College ||
  mongoose.model<ICollegeDocument>("College", collegeSchema);

export default College;
