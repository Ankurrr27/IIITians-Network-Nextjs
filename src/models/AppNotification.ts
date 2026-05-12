import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAppNotificationDocument extends Document {
  title: string;
  message: string;
  type: "milestone" | "post" | "legacy" | "event" | "team" | "club";
  colorTone: "indigo" | "emerald" | "sky" | "amber" | "rose" | "fuchsia" | "slate";
  order: number;
  isActive: boolean;
  showOnEntry: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const appNotificationSchema = new Schema<IAppNotificationDocument>(
  {
    title: { type: String, trim: true, default: "" },
    message: { type: String, trim: true, default: "" },
    type: { type: String, enum: ["milestone", "post", "legacy", "event", "team", "club"], default: "milestone" },
    colorTone: { type: String, enum: ["indigo", "emerald", "sky", "amber", "rose", "fuchsia", "slate"], default: "indigo" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: false },
    showOnEntry: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const AppNotification: Model<IAppNotificationDocument> =
  mongoose.models.AppNotification ||
  mongoose.model<IAppNotificationDocument>("AppNotification", appNotificationSchema);

export default AppNotification;
