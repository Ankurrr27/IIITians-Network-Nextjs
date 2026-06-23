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

export const opportunities: Opportunity[] = [
  // ─── Internships ──────────────────────────────────────────────────────────
  {
    id: "int-1",
    title: "Frontend Engineering Intern",
    company: "Fintech Startup (Alumni Led)",
    category: "Internships",
    location: "Bengaluru",
    workMode: "Hybrid",
    compensation: "₹25,000/month",
    deadline: "Jul 15, 2026",
    description:
      "Build reactive dashboards using Next.js, Tailwind CSS, and state management. Work directly under a Senior Architect (IIIT Gwalior alumnus).",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    recruiterVerified: true,
    companyVerified: true,
    postedDate: "1 day ago",
    applicationLink: "mailto:iiitiansnetwork@gmail.com?subject=Apply: Frontend Intern",
  },
  {
    id: "int-2",
    title: "Product Design Intern",
    company: "IIITians Network Web Team",
    category: "Internships",
    location: "Remote",
    workMode: "Remote",
    compensation: "Unpaid · Open Source Credit",
    deadline: "Aug 1, 2026",
    description:
      "Iterate on user flows, design official merchandising mockups, and run accessibility compliance checks for the centralized network portal.",
    skills: ["Figma", "UI/UX", "Prototyping", "Design Systems"],
    recruiterVerified: true,
    companyVerified: true,
    postedDate: "3 days ago",
    applicationLink: "mailto:iiitiansnetwork@gmail.com?subject=Apply: Product Design",
  },
  {
    id: "int-3",
    title: "Backend Engineering Intern",
    company: "Cloud Scale Tech",
    category: "Internships",
    location: "Pune",
    workMode: "Hybrid",
    compensation: "₹30,000/month",
    deadline: "Jul 30, 2026",
    description:
      "Collaborate on building scalable APIs, optimizing database queries, and integrating Cloudflare CDN caches for a high-traffic SaaS product.",
    skills: ["Node.js", "PostgreSQL", "Redis", "Docker"],
    recruiterVerified: true,
    companyVerified: false,
    postedDate: "1 week ago",
    applicationLink: "mailto:iiitiansnetwork@gmail.com?subject=Apply: Backend Intern",
  },

  // ─── Full-Time ────────────────────────────────────────────────────────────
  {
    id: "ft-1",
    title: "Software Development Engineer",
    company: "TechCorp India",
    category: "Full-Time",
    location: "Hyderabad",
    workMode: "Onsite",
    compensation: "₹12-18 LPA",
    deadline: "Aug 15, 2026",
    description:
      "Join our platform engineering team to build distributed systems at scale. Strong DSA, system design, and backend fundamentals required.",
    skills: ["Java", "System Design", "AWS", "Microservices"],
    recruiterVerified: true,
    companyVerified: true,
    postedDate: "2 days ago",
    applicationLink: "mailto:iiitiansnetwork@gmail.com?subject=Apply: SDE Full-Time",
    featured: true,
  },
  {
    id: "ft-2",
    title: "ML Engineer",
    company: "DataMinds AI",
    category: "Full-Time",
    location: "Bengaluru",
    workMode: "Hybrid",
    compensation: "₹15-22 LPA",
    deadline: "Sep 1, 2026",
    description:
      "Design and deploy production ML pipelines for recommendation systems. Experience with PyTorch, MLflow, and large-scale data processing preferred.",
    skills: ["Python", "PyTorch", "MLflow", "Spark"],
    recruiterVerified: true,
    companyVerified: true,
    postedDate: "4 days ago",
    applicationLink: "mailto:iiitiansnetwork@gmail.com?subject=Apply: ML Engineer",
  },
  {
    id: "ft-3",
    title: "Product Manager",
    company: "EdTech Unicorn",
    category: "Full-Time",
    location: "Delhi NCR",
    workMode: "Onsite",
    compensation: "₹18-25 LPA",
    deadline: "Jul 25, 2026",
    description:
      "Own the product roadmap for student engagement features. Requires strong analytical skills, user research experience, and cross-functional leadership.",
    skills: ["Product Strategy", "Analytics", "SQL", "A/B Testing"],
    recruiterVerified: true,
    companyVerified: true,
    postedDate: "5 days ago",
    applicationLink: "mailto:iiitiansnetwork@gmail.com?subject=Apply: Product Manager",
  },

  // ─── Research ─────────────────────────────────────────────────────────────
  {
    id: "res-1",
    title: "Machine Learning Research Assistant",
    company: "AI Lab, IIIT Delhi",
    category: "Research",
    location: "New Delhi",
    workMode: "Hybrid",
    compensation: "₹20,000/month stipend",
    deadline: "Aug 10, 2026",
    description:
      "Work on computer vision and multimodal model alignment. Ideal for third/fourth-year undergraduate students aiming for research papers.",
    skills: ["Python", "PyTorch", "Computer Vision", "Research"],
    recruiterVerified: true,
    companyVerified: true,
    postedDate: "2 days ago",
    applicationLink: "mailto:iiitiansnetwork@gmail.com?subject=Research: ML Assistant",
  },
  {
    id: "res-2",
    title: "NLP Research Intern",
    company: "LTRC, IIIT Hyderabad",
    category: "Research",
    location: "Hyderabad",
    workMode: "Onsite",
    compensation: "₹15,000/month stipend",
    deadline: "Jul 31, 2026",
    description:
      "Contribute to Indian language translation models. Requires proficiency in Python and deep learning frameworks.",
    skills: ["NLP", "Transformers", "Python", "HuggingFace"],
    recruiterVerified: true,
    companyVerified: true,
    postedDate: "4 days ago",
    applicationLink: "mailto:iiitiansnetwork@gmail.com?subject=Research: NLP Intern",
  },
  {
    id: "res-3",
    title: "Research Fellow — Cryptography",
    company: "IIIT Allahabad Labs",
    category: "Research",
    location: "Allahabad",
    workMode: "Remote",
    compensation: "Fellowship",
    deadline: "Sep 15, 2026",
    description:
      "Investigate zero-knowledge proofs and secure multi-party computations. Background in abstract algebra and complexity theory required.",
    skills: ["Cryptography", "ZK Proofs", "Mathematics", "C++"],
    recruiterVerified: true,
    companyVerified: true,
    postedDate: "2 weeks ago",
    applicationLink: "mailto:iiitiansnetwork@gmail.com?subject=Research: Cryptography Fellow",
  },

  // ─── Open Source ──────────────────────────────────────────────────────────
  {
    id: "os-1",
    title: "Next.js Central Portal Contribution",
    company: "IIITians Network",
    category: "Open Source",
    location: "GitHub",
    workMode: "Remote",
    compensation: "Open Source Credit",
    deadline: "Ongoing",
    description:
      "Help optimize placement search index filters, build the merchandise store grid, and resolve responsiveness bug tickets.",
    skills: ["Next.js", "React", "TypeScript", "MongoDB"],
    recruiterVerified: true,
    companyVerified: true,
    postedDate: "5 days ago",
    applicationLink: "https://github.com/Ankurrr27/IIITians-Network-Nextjs",
  },
  {
    id: "os-2",
    title: "Discuss Forums Auth Integration",
    company: "Student Discuss Team",
    category: "Open Source",
    location: "GitHub",
    workMode: "Remote",
    compensation: "Open Source Credit",
    deadline: "Ongoing",
    description:
      "Implement secure OAuth flows for official club manager profiles using NextAuth and MongoDB adapter patterns.",
    skills: ["NextAuth", "OAuth", "MongoDB", "Security"],
    recruiterVerified: true,
    companyVerified: true,
    postedDate: "1 week ago",
    applicationLink: "https://github.com/Ankurrr27/IIITians-Network-Nextjs",
  },

  // ─── Hackathons ───────────────────────────────────────────────────────────
  {
    id: "hk-1",
    title: "Inter-IIIT Hackathon 2026",
    company: "IIITians Network Community",
    category: "Hackathons",
    location: "Online / Hybrid",
    workMode: "Remote",
    compensation: "Prizes + Certificates",
    deadline: "Jul 20, 2026",
    description:
      "24-hour development sprint bringing teams from all 25+ IIITs to solve structural challenges in education, tech, and college outreach.",
    skills: ["Full Stack", "Problem Solving", "Teamwork", "Pitching"],
    recruiterVerified: true,
    companyVerified: true,
    postedDate: "Just now",
    applicationLink: "mailto:iiitiansnetwork@gmail.com?subject=Hackathon Register",
    featured: true,
  },
  {
    id: "hk-2",
    title: "Smart India Hackathon Prep-Sprint",
    company: "Coding Clubs Joint Alliance",
    category: "Hackathons",
    location: "Host Campuses",
    workMode: "Onsite",
    compensation: "Mentorship + Certificates",
    deadline: "Aug 5, 2026",
    description:
      "A preparatory mock hackathon featuring review panels of senior alumni who previously won SIH to critique problem statements.",
    skills: ["Prototyping", "Presentation", "Full Stack", "Innovation"],
    recruiterVerified: true,
    companyVerified: false,
    postedDate: "3 days ago",
    applicationLink: "mailto:iiitiansnetwork@gmail.com?subject=SIH Prep Sprint",
  },

  // ─── Startups ─────────────────────────────────────────────────────────────
  {
    id: "st-1",
    title: "Founding Engineer",
    company: "NexEd (IIIT Hyderabad Alumni)",
    category: "Startups",
    location: "Bengaluru",
    workMode: "Onsite",
    compensation: "₹8-14 LPA + Equity",
    deadline: "Aug 20, 2026",
    description:
      "Join as the first engineer at an EdTech startup building AI-powered personalized learning paths for competitive exam preparation. Founded by IIIT Hyderabad alumni.",
    skills: ["React", "Node.js", "Python", "AI/ML"],
    recruiterVerified: true,
    companyVerified: true,
    postedDate: "1 day ago",
    applicationLink: "mailto:iiitiansnetwork@gmail.com?subject=Apply: Founding Engineer",
    featured: true,
  },
  {
    id: "st-2",
    title: "Growth Intern",
    company: "HealthStack (Seed Stage)",
    category: "Startups",
    location: "Remote",
    workMode: "Remote",
    compensation: "₹15,000/month + Equity",
    deadline: "Jul 28, 2026",
    description:
      "Drive user acquisition and retention for a HealthTech startup building remote diagnostics tools for Tier-2/3 cities. Perfect for product-minded builders.",
    skills: ["Growth Marketing", "Analytics", "SQL", "Product Sense"],
    recruiterVerified: true,
    companyVerified: false,
    postedDate: "2 days ago",
    applicationLink: "mailto:iiitiansnetwork@gmail.com?subject=Apply: Growth Intern",
  },
  {
    id: "st-3",
    title: "Product Intern — 0→1",
    company: "FinOps Labs (Pre-Seed)",
    category: "Startups",
    location: "Delhi NCR",
    workMode: "Hybrid",
    compensation: "₹20,000/month + Equity",
    deadline: "Aug 10, 2026",
    description:
      "Help define and ship the MVP of a FinTech product automating expense management for Indian SMEs. Work directly with the founding team (IIIT Delhi alumni).",
    skills: ["Product Management", "Wireframing", "User Research", "Notion"],
    recruiterVerified: true,
    companyVerified: true,
    postedDate: "6 days ago",
    applicationLink: "mailto:iiitiansnetwork@gmail.com?subject=Apply: Product Intern Startup",
  },
];
