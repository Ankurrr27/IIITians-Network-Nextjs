import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITermTenureDocument extends Document {
  memberId: mongoose.Types.ObjectId;
  termId: mongoose.Types.ObjectId;
  committeeId: mongoose.Types.ObjectId;
  roleId: mongoose.Types.ObjectId;
  status: "ACTIVE" | "PROMOTED" | "ARCHIVED" | "REMOVED";
  createdAt?: Date;
  updatedAt?: Date;
}

const termTenureSchema = new Schema<ITermTenureDocument>(
  {
    memberId: { type: Schema.Types.ObjectId, ref: "TeamMember", required: true },
    termId: { type: Schema.Types.ObjectId, ref: "Term", required: true },
    committeeId: { type: Schema.Types.ObjectId, ref: "Committee", required: true },
    roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    status: { type: String, enum: ["ACTIVE", "PROMOTED", "ARCHIVED", "REMOVED"], default: "ACTIVE" },
  },
  { timestamps: true }
);

const TermTenure: Model<ITermTenureDocument> =
  mongoose.models.TermTenure || mongoose.model<ITermTenureDocument>("TermTenure", termTenureSchema);

export default TermTenure;
