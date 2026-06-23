import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOpportunityDocument extends Document {
  title: string;
  company: string;
  category: "Internships" | "Full-Time" | "Research" | "Open Source" | "Hackathons" | "Startups";
  location: string;
  workMode: "Remote" | "Hybrid" | "Onsite";
  compensation: string;
  deadline: string;
  description: string;
  skills: string[];
  applicationLink: string;
  recruiterEmail: string;
  recruiterLinkedIn?: string;
  recruiterVerified: boolean;
  companyVerified: boolean;
  status: "pending" | "approved" | "rejected";
  featured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const opportunitySchema = new Schema<IOpportunityDocument>(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["Internships", "Full-Time", "Research", "Open Source", "Hackathons", "Startups"],
      index: true,
    },
    location: { type: String, required: true, trim: true },
    workMode: {
      type: String,
      required: true,
      enum: ["Remote", "Hybrid", "Onsite"],
    },
    compensation: { type: String, trim: true, default: "" },
    deadline: { type: String, trim: true, default: "" },
    description: { type: String, required: true, trim: true },
    skills: { type: [String], default: [] },
    applicationLink: { type: String, trim: true, default: "" },
    recruiterEmail: { type: String, required: true, lowercase: true, trim: true },
    recruiterLinkedIn: { type: String, trim: true, default: "" },
    recruiterVerified: { type: Boolean, default: false },
    companyVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Enable text search on key text fields
opportunitySchema.index({
  title: "text",
  company: "text",
  description: "text",
  skills: "text",
});

const Opportunity: Model<IOpportunityDocument> =
  mongoose.models.Opportunity ||
  mongoose.model<IOpportunityDocument>("Opportunity", opportunitySchema);

export default Opportunity;
