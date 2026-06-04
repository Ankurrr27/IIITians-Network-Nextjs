import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeamMemberDocument extends Document {
  name: string;
  iiit: string;
  photo?: { public_id?: string; url: string };
  email: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  currentCompany?: string;
  location?: string;
  aboutText?: string;
  messageText?: string;
  role?: string;
  roleType?: string;
  team?: string;
  year?: string;
  isActive?: boolean;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const teamMemberSchema = new Schema<ITeamMemberDocument>(
  {
    name: { type: String, required: true, trim: true },
    iiit: { type: String, required: true, trim: true },
    photo: { public_id: String, url: { type: String, required: true } },
    email: { type: String, required: true, lowercase: true, trim: true },
    linkedin: String,
    instagram: String,
    twitter: String,
    currentCompany: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    aboutText: { type: String, trim: true },
    messageText: { type: String, trim: true },
    role: { type: String, default: "Member" },
    roleType: { type: String, default: "MEMBER" },
    team: { type: String, default: "Core" },
    year: { type: String, default: "" },
    isActive: { type: Boolean, default: false },
    order: { type: Number, default: 9999 },
  },
  { timestamps: true }
);

const TeamMember: Model<ITeamMemberDocument> =
  mongoose.models.TeamMember ||
  mongoose.model<ITeamMemberDocument>("TeamMember", teamMemberSchema);

export default TeamMember;
