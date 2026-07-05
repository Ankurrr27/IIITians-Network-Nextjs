// src/data/opportunities.ts
// Static opportunity data for the talent marketplace.
// Future: replaced by API calls to /api/opportunities

export type OpportunityCategory =
  | "Internships"
  | "Full-Time"
  | "Research"
  | "Open Source"
  | "Hackathons"
  | "Startups";

export type WorkMode = "Remote" | "Hybrid" | "Onsite";

export type VerificationStatus = "verified" | "pending" | "unverified";

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  category: OpportunityCategory;
  location: string;
  workMode: WorkMode;
  compensation: string;
  deadline: string;
  description: string;
  skills: string[];
  recruiterVerified: boolean;
  companyVerified: boolean;
  postedDate: string;
  applicationLink: string;
  featured?: boolean;
}

export const CATEGORY_ALL = "All" as const;

export const CATEGORIES: OpportunityCategory[] = [
  "Internships",
  "Full-Time",
  "Research",
  "Open Source",
  "Hackathons",
  "Startups",
];

// No hardcoded opportunities — all data comes from the database via /api/opportunities
export const opportunities: Opportunity[] = [];
