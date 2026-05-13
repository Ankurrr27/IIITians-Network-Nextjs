import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import DiscussAccount from "@/models/DiscussAccount";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
    const { handle, email, password } = await req.json();
    const normalizedEmail = normalizeHandle(handle || email);

    if (!normalizedEmail || !password) {
      return NextResponse.json({ message: "Handle & password required" }, { status: 400 });
    }

    const account = await DiscussAccount.findOne({ email: normalizedEmail });
    if (!account) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const match = await bcrypt.compare(password, account.password);
    if (!match) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    if (!account.isAuthorized) {
      return NextResponse.json(
        { message: "Your club request is still pending admin approval. Wait for verification first." },
        { status: 403 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not configured");

    const token = jwt.sign({ id: account._id.toString(), kind: "discuss_account" }, secret, { expiresIn: "7d" });

    account.lastLogin = new Date();
    await account.save();

    return NextResponse.json({
      token,
      account: {
        _id: account._id,
        collegeName: account.collegeName,
        clubName: account.clubName,
        contactName: account.contactName,
        contactPhone: account.contactPhone,
        website: account.website,
        email: account.email,
        role: account.role,
        isAuthorized: account.isAuthorized,
        badgeLabel: account.badgeLabel,
        lastLogin: account.lastLogin,
        createdAt: account.createdAt,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
