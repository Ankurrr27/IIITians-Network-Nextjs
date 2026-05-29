import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRoleHistory {
  role: string;
  team: string;
  year: string;
}

export interface IAlumniDocument extends Document {
  name: string;
  email: string;
  iiit: string;
  graduationYear: number;
  generation: string;
  branch: string;
  networkPost?: string;
  currentRole?: string;
  currentCompany?: string;
  location?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  bio?: string;
  contribution?: string;
  photo?: { public_id?: string; url?: string };
  status: "pending" | "approved" | "rejected";
  legacyType: "alumni" | "team_member";
  sourceTeamMemberId?: mongoose.Types.ObjectId | null;
  roleHistory?: IRoleHistory[];
  reviewedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const roleHistorySchema = new Schema<IRoleHistory>(
  { role: { type: String, trim: true, default: "" }, team: { type: String, trim: true, default: "" }, year: { type: String, trim: true, default: "" } },
  { _id: false }
);

const alumniSchema = new Schema<IAlumniDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    iiit: { type: String, required: true, trim: true },
    graduationYear: { type: Number, required: true, min: 2000, max: 2100 },
    generation: { type: String, required: true, trim: true },
    branch: { type: String, required: true, trim: true },
    networkPost: { type: String, trim: true, default: "" },
    currentRole: { type: String, trim: true, default: "" },
    currentCompany: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    linkedin: { type: String, trim: true, default: "" },
    instagram: { type: String, trim: true, default: "" },
    twitter: { type: String, trim: true, default: "" },
    bio: { type: String, trim: true, maxlength: 500, default: "" },
    contribution: { type: String, trim: true, maxlength: 800, default: "" },
    photo: { public_id: { type: String, trim: true }, url: { type: String, trim: true } },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    reviewedAt: { type: Date, default: null },
    legacyType: { type: String, enum: ["alumni", "team_member"], default: "alumni", index: true },
    sourceTeamMemberId: { type: Schema.Types.ObjectId, ref: "TeamMember", default: null, index: true },
    roleHistory: { type: [roleHistorySchema], default: [] },
  },
  { timestamps: true }
);

alumniSchema.index({ name: "text", iiit: "text", branch: "text", currentRole: "text", currentCompany: "text", generation: "text" });

const Alumni: Model<IAlumniDocument> =
  mongoose.models.Alumni || mongoose.model<IAlumniDocument>("Alumni", alumniSchema);

export default Alumni;
