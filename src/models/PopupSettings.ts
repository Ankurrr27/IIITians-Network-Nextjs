import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPopupSettingsDocument extends Document {
  key: string;
  enabled: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const popupSettingsSchema = new Schema<IPopupSettingsDocument>(
  {
    key: { type: String, default: "tournament_popup", unique: true, required: true },
    enabled: { type: Boolean, default: false },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const PopupSettings: Model<IPopupSettingsDocument> =
  mongoose.models.PopupSettings || mongoose.model<IPopupSettingsDocument>("PopupSettings", popupSettingsSchema);

export default PopupSettings;
