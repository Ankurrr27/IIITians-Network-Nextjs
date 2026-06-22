import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDiscussQueryDocument extends Document {
  title: string;
  body: string;
  category: string;
  clubName: string;
  collegeName: string;
  upvotes: number;
  views: number;
  replies: number;
  account: mongoose.Types.ObjectId;
  votedAccounts: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const discussQuerySchema = new Schema<IDiscussQueryDocument>(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, default: "Club Help" },
    clubName: { type: String, required: true, trim: true, default: "Anonymous" },
    collegeName: { type: String, trim: true, default: "" },
    upvotes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    replies: { type: Number, default: 0 },
    account: { type: Schema.Types.ObjectId, ref: "DiscussAccount", required: true },
    votedAccounts: [{ type: Schema.Types.ObjectId, ref: "DiscussAccount" }],
  },
  { timestamps: true }
);

const DiscussQuery: Model<IDiscussQueryDocument> =
  mongoose.models.DiscussQuery ||
  mongoose.model<IDiscussQueryDocument>("DiscussQuery", discussQuerySchema);

export default DiscussQuery;
