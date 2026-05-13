import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import DiscussAccount from "@/models/DiscussAccount";
import bcrypt from "bcryptjs";

const DOMAIN = "@iiitiansnetwork";

function normalizeHandle(value = ""): string {
  const raw = value.trim().toLowerCase();
  if (!raw) return "";
  const handle = raw.includes("@") ? raw.split("@")[0] : raw;
  const safe = handle.replace(/[^a-z0-9._-]/g, "");
  return safe ? `${safe}${DOMAIN}` : "";
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { collegeName, clubName, contactName, contactPhone, website, handle, email, password } = body;

    const normalizedEmail = normalizeHandle(handle || email);

    if (!collegeName || !clubName || !contactName || !normalizedEmail || !password) {
      return NextResponse.json({ message: "All required fields must be provided" }, { status: 400 });
    }

    const exists = await DiscussAccount.findOne({ email: normalizedEmail });
    if (exists) {
      return NextResponse.json({ message: "Discuss account already exists" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const account = await DiscussAccount.create({
      collegeName,
      clubName,
      contactName,
      contactPhone,
      website,
      email: normalizedEmail,
      password: hashed,
    });

    return NextResponse.json({
      message: "Discuss account created. Wait for admin authorization.",
      account: {
        _id: account._id,
        collegeName: account.collegeName,
        clubName: account.clubName,
        contactName: account.contactName,
        email: account.email,
        isAuthorized: account.isAuthorized,
        createdAt: account.createdAt,
      },
    }, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      return NextResponse.json({ message: "Discuss account already exists" }, { status: 409 });
    }
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
