import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Opportunity from "@/models/Opportunity";
import { isBlockedRecruiterEmail } from "@/data/iiitDomains";

function sanitizeString(str: string): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// GET /api/opportunities — Fetch approved opportunities
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Auto-seed database with mock listings if empty
    const count = await Opportunity.countDocuments();
    if (count === 0) {
      const { opportunities: seedData } = await import("@/data/opportunities");
      const prepared = seedData.map((opp) => ({
        title: opp.title,
        company: opp.company,
        category: opp.category,
        location: opp.location,
        workMode: opp.workMode,
        compensation: opp.compensation,
        deadline: opp.deadline,
        description: opp.description,
        skills: opp.skills,
        applicationLink: opp.applicationLink,
        recruiterEmail: "iiitiansnetwork@gmail.com",
        recruiterVerified: opp.recruiterVerified ?? false,
        companyVerified: opp.companyVerified ?? false,
        status: "approved",
        featured: opp.featured ?? false,
      }));
      await Opportunity.insertMany(prepared);
    }

    const url = req.nextUrl;
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { status: "approved" };

    if (category && category !== "All") {
      query.category = category;
    }

    if (search && search.trim()) {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        { company: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
        { skills: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const listings = await Opportunity.find(query).sort({ featured: -1, createdAt: -1 });
    return NextResponse.json(listings);
  } catch (err: unknown) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

// POST /api/opportunities — Recruiter submits a pending opportunity
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      title,
      company,
      category,
      location,
      workMode,
      description,
      recruiterEmail,
      compensation,
      deadline,
      skills,
      applicationLink,
      recruiterLinkedIn,
    } = body;

    // Required fields check
    if (
      !title?.trim() ||
      !company?.trim() ||
      !category?.trim() ||
      !location?.trim() ||
      !workMode?.trim() ||
      !description?.trim() ||
      !recruiterEmail?.trim()
    ) {
      return NextResponse.json(
        { message: "All required fields must be filled" },
        { status: 400 }
      );
    }

    const trimmedEmail = recruiterEmail.trim();

    // Verify email structure
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { message: "Invalid email address structure" },
        { status: 400 }
      );
    }

    // Verify blocked domains (no personal accounts like gmail, yahoo)
    if (isBlockedRecruiterEmail(trimmedEmail)) {
      return NextResponse.json(
        { message: "Personal email accounts are not permitted. Please use your official corporate or business email." },
        { status: 400 }
      );
    }

    // Validate category enum
    const validCategories = ["Internships", "Full-Time", "Research", "Open Source", "Hackathons", "Startups"];
    if (!validCategories.includes(category.trim())) {
      return NextResponse.json({ message: "Invalid opportunity category" }, { status: 400 });
    }

    // Validate workMode enum
    const validWorkModes = ["Remote", "Hybrid", "Onsite"];
    if (!validWorkModes.includes(workMode.trim())) {
      return NextResponse.json({ message: "Invalid work mode option" }, { status: 400 });
    }

    // Skills array conversion and sanitization
    let skillsArray: string[] = [];
    if (Array.isArray(skills)) {
      skillsArray = skills.map((s) => sanitizeString(String(s).trim())).filter(Boolean);
    } else if (typeof skills === "string" && skills.trim()) {
      skillsArray = skills.split(",").map((s) => sanitizeString(s.trim())).filter(Boolean);
    }

    const opportunity = await Opportunity.create({
      title: sanitizeString(title.trim()).slice(0, 100),
      company: sanitizeString(company.trim()).slice(0, 100),
      category: category.trim(),
      location: sanitizeString(location.trim()).slice(0, 100),
      workMode: workMode.trim(),
      compensation: sanitizeString(compensation || "").trim().slice(0, 100),
      deadline: sanitizeString(deadline || "").trim().slice(0, 100),
      description: sanitizeString(description.trim()).slice(0, 3000),
      skills: skillsArray,
      applicationLink: sanitizeString(applicationLink || "").trim().slice(0, 200),
      recruiterEmail: trimmedEmail.toLowerCase().slice(0, 100),
      recruiterLinkedIn: sanitizeString(recruiterLinkedIn || "").trim().slice(0, 200),
      status: "pending",
      recruiterVerified: false,
      companyVerified: false,
      featured: false,
    });

    return NextResponse.json(opportunity, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
