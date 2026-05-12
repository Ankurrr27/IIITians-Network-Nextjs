import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdminDocument extends Document {
  email: string;
  password: string;
  role: "super_admin" | "admin";
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const adminSchema = new Schema<IAdminDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["super_admin", "admin"], default: "admin" },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

const Admin: Model<IAdminDocument> =
  mongoose.models.Admin || mongoose.model<IAdminDocument>("Admin", adminSchema);

export default Admin;
