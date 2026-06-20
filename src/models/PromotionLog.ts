import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPromotionLogDocument extends Document {
  memberId: mongoose.Types.ObjectId;
  fromRoleId: mongoose.Types.ObjectId;
  toRoleId: mongoose.Types.ObjectId;
  termId: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId; // Ref to Admin user
  reason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const promotionLogSchema = new Schema<IPromotionLogDocument>(
  {
    memberId: { type: Schema.Types.ObjectId, ref: "TeamMember", required: true },
    fromRoleId: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    toRoleId: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    termId: { type: Schema.Types.ObjectId, ref: "Term", required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    reason: { type: String, trim: true },
  },
  { timestamps: true }
);

const PromotionLog: Model<IPromotionLogDocument> =
  mongoose.models.PromotionLog || mongoose.model<IPromotionLogDocument>("PromotionLog", promotionLogSchema);

export default PromotionLog;
