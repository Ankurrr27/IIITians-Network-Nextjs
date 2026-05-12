import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEventDocument extends Document {
  title: string;
  description?: string;
  date: Date;
  collegeName: string;
  clubName?: string;
  link?: string;
  banner?: { public_id?: string; url?: string };
  sourceDiscussPostId?: mongoose.Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const eventSchema = new Schema<IEventDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    date: { type: Date, required: true },
    collegeName: { type: String, required: true, trim: true },
    clubName: { type: String, default: "", trim: true },
    link: { type: String, default: "", trim: true },
    banner: { public_id: String, url: String },
    sourceDiscussPostId: {
      type: Schema.Types.ObjectId,
      ref: "Discuss",
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

const Event: Model<IEventDocument> =
  mongoose.models.Event || mongoose.model<IEventDocument>("Event", eventSchema);

export default Event;
