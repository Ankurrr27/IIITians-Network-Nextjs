import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISiteStatsDocument extends Document {
  totalViews: number;
  totalVisits?: number;
  instagramFollowers?: number;
  linkedinFollowers?: number;
  overallReach?: number;
  updatedAt?: Date;
}

const siteStatsSchema = new Schema<ISiteStatsDocument>(
  {
    totalViews: { type: Number, default: 0 },
    totalVisits: { type: Number, default: 0 },
    instagramFollowers: { type: Number, default: 12400 },
    linkedinFollowers: { type: Number, default: 18500 },
    overallReach: { type: Number, default: 750000 },
  },
  { timestamps: true }
);

const SiteStats: Model<ISiteStatsDocument> =
  mongoose.models.SiteStats ||
  mongoose.model<ISiteStatsDocument>("SiteStats", siteStatsSchema);

export default SiteStats;
