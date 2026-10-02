import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITeamRequestDocument extends Document {
  applicantType: "NEW" | "EXISTING";
  name: string;
  email: string;
  iiit: string;
  team: string;
  role: string;
  year: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  aboutText?: string;
  messageText?: string;
  photo?: { public_id?: string; url: string };
  memberId?: mongoose.Types.ObjectId | null;
  status: "pending" | "approved" | "rejected";
  reviewedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const teamRequestSchema = new Schema<ITeamRequestDocument>(
  {
    applicantType: { type: String, enum: ["NEW", "EXISTING"], default: "NEW", required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    iiit: { type: String, trim: true, default: "" },
    team: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    year: { type: String, required: true, trim: true },
    linkedin: { type: String, trim: true, default: "" },
    instagram: { type: String, trim: true, default: "" },
    twitter: { type: String, trim: true, default: "" },
    aboutText: { type: String, trim: true, default: "" },
    messageText: { type: String, trim: true, default: "" },
    photo: { public_id: String, url: String },
    memberId: { type: Schema.Types.ObjectId, ref: "TeamMember", default: null },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const TeamRequest: Model<ITeamRequestDocument> =
  mongoose.models.TeamRequest || mongoose.model<ITeamRequestDocument>("TeamRequest", teamRequestSchema);

export default TeamRequest;
