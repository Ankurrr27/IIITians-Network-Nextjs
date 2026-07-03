import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdminLogDocument extends Document {
  adminId: mongoose.Types.ObjectId;
  adminEmail: string;
  action: string;
  targetResource: string;
  targetId?: string;
  details?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const adminLogSchema = new Schema<IAdminLogDocument>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    adminEmail: { type: String, required: true, trim: true },
    action: { type: String, required: true, trim: true },
    targetResource: { type: String, required: true, trim: true },
    targetId: { type: String },
    details: { type: String, trim: true },
  },
  { timestamps: true }
);

const AdminLog: Model<IAdminLogDocument> =
  mongoose.models.AdminLog || mongoose.model<IAdminLogDocument>("AdminLog", adminLogSchema);

export default AdminLog;
