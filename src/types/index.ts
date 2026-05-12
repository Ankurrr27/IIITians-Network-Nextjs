// src/types/index.ts
// Shared TypeScript types for the entire application.

export interface CloudinaryAsset {
  public_id?: string;
  url?: string;
}

export interface ClubLink {
  name: string;
  url: string;
}

export interface GalleryImage {
  _id?: string;
  public_id?: string;
  url: string;
  caption?: string;
  category?: "infrastructure" | "clubs" | "events" | "others";
  createdAt?: string;
}

export interface ICollege {
  _id: string;
  name: string;
  photo?: CloudinaryAsset;
  logo?: CloudinaryAsset;
  description?: string;
  website?: string;
  clubLink?: string;
  clubLinks?: ClubLink[];
  gallery?: GalleryImage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IClub {
  _id: string;
  name: string;
  collegeId: string;
  logo: string;
  description?: string;
  leads?: string[];
  gallery?: string[];
  createdAt?: string;
}

export interface IEvent {
  _id: string;
  title: string;
  description?: string;
  date: string;
  collegeName: string;
  clubName?: string;
  link?: string;
  type?: string;
  isPublished?: boolean;
  banner?: CloudinaryAsset;
  sourceDiscussPostId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleHistory {
  role: string;
  team: string;
  year: string;
}

export interface IAlumni {
  _id: string;
  name: string;
  email: string;
  iiit: string;
  graduationYear: number;
  generation: string;
  branch: string;
  networkPost?: string;
  currentRole?: string;
  currentCompany?: string;
  location?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  bio?: string;
  photo?: CloudinaryAsset;
  status: "pending" | "approved" | "rejected";
  legacyType: "alumni" | "team_member";
  sourceTeamMemberId?: string | null;
  roleHistory?: RoleHistory[];
  reviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ITeamMember {
  _id: string;
  name: string;
  role: string;
  roleType: "EXEC" | "LEAD" | "MEMBER";
  iiit: string;
  photo?: CloudinaryAsset;
  email: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  currentCompany?: string;
  location?: string;
  aboutText?: string;
  messageText?: string;
  team: "Core" | "Tech" | "Development" | "Design" | "Content" | "Social Media";
  year: string;
  isActive?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BranchPlacement {
  branch: string;
  highestPackage: number;
  averagePackage: number;
  lowestPackage: number;
  placementPercentage: number;
  studentsPlaced: number;
  totalStudents: number;
}

export interface YearlyPlacement {
  year: number;
  placements: BranchPlacement[];
}

export interface IPlacement {
  _id: string;
  college: string | ICollege;
  yearlyPlacements: YearlyPlacement[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IAdmin {
  id: string;
  email: string;
  role: "super_admin" | "admin";
  lastLogin?: string;
  createdAt?: string;
}

export interface IDiscussPost {
  _id: string;
  title: string;
  description: string;
  type: "announcement" | "event" | "campaign" | "collaboration" | "opportunity";
  collegeName: string;
  clubName: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  actionLink?: string;
  eventDate?: string | null;
  banner?: CloudinaryAsset;
  photos?: CloudinaryAsset[];
  account: string | IDiscussAccount;
  accountRole?: string;
  isAuthorisedPost?: boolean;
  badgeLabel?: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
  updatedAt?: string;
}

export interface IDiscussAccount {
  _id: string;
  collegeName: string;
  clubName: string;
  contactName: string;
  contactPhone?: string;
  website?: string;
  email: string;
  role: "club_member" | "club_manager" | "publisher";
  isAuthorized: boolean;
  badgeLabel?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAppNotification {
  _id: string;
  title: string;
  message: string;
  type: "milestone" | "post" | "legacy" | "event" | "team" | "club";
  colorTone: "indigo" | "emerald" | "sky" | "amber" | "rose" | "fuchsia" | "slate";
  order: number;
  isActive: boolean;
  showOnEntry: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISiteStats {
  _id: string;
  totalViews?: number;
  totalVisits?: number;
  updatedAt?: string;
}
