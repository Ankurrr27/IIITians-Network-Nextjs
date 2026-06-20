import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRoleDocument extends Document {
  name: string; // "Executive", "Senior Coordinator", "Coordinator", "Volunteer"
  level: number; // For hierarchy calculations: 100 for President, 10 for Volunteer
  roleType: "EXEC" | "LEAD" | "MEMBER"; // Legacy compat
  permissions: string[]; // ["MANAGE_TEAM", "MANAGE_EVENTS", "APPROVE_PROMOTIONS"]
  createdAt?: Date;
  updatedAt?: Date;
}

const roleSchema = new Schema<IRoleDocument>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    level: { type: Number, required: true, default: 10 },
    roleType: { type: String, required: true, enum: ["EXEC", "LEAD", "MEMBER"] },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

const Role: Model<IRoleDocument> =
  mongoose.models.Role || mongoose.model<IRoleDocument>("Role", roleSchema);

export default Role;
