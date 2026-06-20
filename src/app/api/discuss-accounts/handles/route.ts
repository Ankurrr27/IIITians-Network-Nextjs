import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import DiscussAccount from "@/models/DiscussAccount";

// GET /api/discuss-accounts/handles — public list of club names for login datalist
export async function GET() {
  try {
    await connectDB();
    const accounts = await DiscussAccount.find(
      { isAuthorized: true },
      { clubName: 1, _id: 0 }
    ).lean();
    
    const names = Array.from(
      new Set(
        accounts
          .map((a: { clubName?: string }) => (a.clubName || "").trim())
          .filter(Boolean)
      )
    );
    
    return NextResponse.json(names);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
