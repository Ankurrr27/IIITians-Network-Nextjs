import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDiscussAccountDocument extends Document {
  collegeName: string;
  clubName: string;
  contactName: string;
  contactPhone?: string;
  website?: string;
  email: string;
  password: string;
  role: "club_member" | "club_manager" | "publisher";
  isAuthorized: boolean;
  badgeLabel?: string;
  lastLogin?: Date;
  logo?: { public_id?: string; url?: string };
  createdAt?: Date;
  updatedAt?: Date;
}

const discussAccountSchema = new Schema<IDiscussAccountDocument>(
  {
    collegeName: { type: String, required: true, trim: true },
    clubName: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    contactPhone: { type: String, trim: true },
    website: { type: String, trim: true, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["club_member", "club_manager", "publisher"], default: "club_member" },
    isAuthorized: { type: Boolean, default: false },
    badgeLabel: { type: String, trim: true, default: "Pending verification" },
    lastLogin: { type: Date },
    logo: { public_id: String, url: String },
  },
  { timestamps: true }
);

const DiscussAccount: Model<IDiscussAccountDocument> =
  mongoose.models.DiscussAccount ||
  mongoose.model<IDiscussAccountDocument>("DiscussAccount", discussAccountSchema);

export default DiscussAccount;
