import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISiteStatsDocument extends Document {
  totalViews: number;
  totalVisits?: number;
  updatedAt?: Date;
}

const siteStatsSchema = new Schema<ISiteStatsDocument>(
  {
    totalViews: { type: Number, default: 0 },
    totalVisits: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const SiteStats: Model<ISiteStatsDocument> =
  mongoose.models.SiteStats ||
  mongoose.model<ISiteStatsDocument>("SiteStats", siteStatsSchema);

export default SiteStats;
