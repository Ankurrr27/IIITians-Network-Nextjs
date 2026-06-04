import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import DiscussAccount from "@/models/DiscussAccount";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const escapeRegex = (string: string) => {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { clubName, contactName, password } = await req.json();

    if (!clubName || !contactName || !password) {
      return NextResponse.json(
        { message: "Club Name, POC Name & Password are required" },
        { status: 400 }
      );
    }

    const account = await DiscussAccount.findOne({
      contactName: { $regex: new RegExp(`^${escapeRegex(contactName.trim())}$`, "i") },
      clubName: { $regex: new RegExp(`^${escapeRegex(clubName.trim())}$`, "i") }
    });

    if (!account) {
      return NextResponse.json(
        { message: "Invalid club name or POC name" },
        { status: 401 }
      );
    }

    // Direct comparison (plaintext) or bcrypt hash match
    const match = password === account.password || await bcrypt.compare(password, account.password).catch(() => false);
    if (!match) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    if (!account.isAuthorized) {
      return NextResponse.json(
        { message: "Your club request is still pending admin approval." },
        { status: 403 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not configured");

    const token = jwt.sign({ id: account._id.toString(), kind: "discuss_account" }, secret, { expiresIn: "36500d" });

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
