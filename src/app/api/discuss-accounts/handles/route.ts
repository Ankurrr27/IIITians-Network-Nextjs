import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import DiscussAccount from "@/models/DiscussAccount";

// GET /api/discuss-accounts/handles — public list of club names for login datalist
export async function GET() {
  try {
    await connectDB();
    const accounts = await DiscussAccount.find(
      { isAuthorized: true },
      { email: 1, clubName: 1, _id: 0 }
    ).lean();
    // Extract the handle prefix from normalized email (e.g. "ecellkota@iiitiansnetwork" → "ecellkota")
    const handles = accounts
      .map((a: { email?: string }) => {
        const email = a.email || "";
        return email.includes("@") ? email.split("@")[0] : email;
      })
      .filter(Boolean);
    return NextResponse.json(handles);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
