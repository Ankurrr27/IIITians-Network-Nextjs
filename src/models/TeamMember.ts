import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeamMemberDocument extends Document {
  name: string;
  role: string;
  roleType: "EXEC" | "LEAD" | "MEMBER";
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
  team: "Core" | "Tech" | "Development" | "Design" | "Content" | "Social Media";
  year: string;
  isActive?: boolean;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const teamMemberSchema = new Schema<ITeamMemberDocument>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    roleType: { type: String, required: true, enum: ["EXEC", "LEAD", "MEMBER"] },
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
    team: { type: String, required: true, enum: ["Core", "Tech", "Development", "Design", "Content", "Social Media"] },
    year: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const TeamMember: Model<ITeamMemberDocument> =
  mongoose.models.TeamMember ||
  mongoose.model<ITeamMemberDocument>("TeamMember", teamMemberSchema);

export default TeamMember;
