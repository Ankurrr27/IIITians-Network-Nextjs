import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDiscussDocument extends Document {
  title: string;
  description: string;
  type: "announcement" | "event" | "campaign" | "collaboration" | "opportunity";
  collegeName: string;
  clubName: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  actionLink?: string;
  eventDate?: Date | null;
  banner?: { public_id?: string; url?: string };
  photos?: { public_id?: string; url?: string }[];
  account: mongoose.Types.ObjectId;
  accountRole?: string;
  isAuthorisedPost?: boolean;
  badgeLabel?: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: Date;
  updatedAt?: Date;
}

const discussSchema = new Schema<IDiscussDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    type: { type: String, enum: ["announcement", "event", "campaign", "collaboration", "opportunity"], default: "announcement" },
    collegeName: { type: String, required: true, trim: true },
    clubName: { type: String, required: true, trim: true },
    contactName: { type: String, trim: true },
    contactEmail: { type: String, trim: true, lowercase: true },
    contactPhone: { type: String, trim: true },
    actionLink: { type: String, trim: true },
    eventDate: { type: Date, default: null },
    banner: { public_id: { type: String, trim: true }, url: { type: String, trim: true } },
    photos: [{ public_id: { type: String, trim: true }, url: { type: String, trim: true } }],
    account: { type: Schema.Types.ObjectId, ref: "DiscussAccount", required: true },
    accountRole: { type: String, trim: true },
    isAuthorisedPost: { type: Boolean, default: false },
    badgeLabel: { type: String, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

const Discuss: Model<IDiscussDocument> =
  mongoose.models.Discuss ||
  mongoose.model<IDiscussDocument>("Discuss", discussSchema);

export default Discuss;
