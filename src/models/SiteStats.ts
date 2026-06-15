import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISiteStatsDocument extends Document {
  key: string;
  totalViews: number;
  totalVisits: number;
  instagramFollowers: number;
  linkedinFollowers: number;
  overallReach: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const siteStatsSchema = new Schema<ISiteStatsDocument>(
  {
    key: {
      type: String,
      default: "global_stats",
      unique: true,
      required: true,
    },
    totalViews: {
      type: Number,
      default: 0,
    },
    totalVisits: {
      type: Number,
      default: 0,
    },
    instagramFollowers: {
      type: Number,
      default: 20000,
    },
    linkedinFollowers: {
      type: Number,
      default: 15500,
    },
    overallReach: {
      type: Number,
      default: 950000,
    },
  },
  {
    timestamps: true,
  }
);

const SiteStats: Model<ISiteStatsDocument> =
  mongoose.models.SiteStats ||
  mongoose.model<ISiteStatsDocument>("SiteStats", siteStatsSchema);

export default SiteStats;