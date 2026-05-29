import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Term from "@/models/Term";
import TermTenure from "@/models/TermTenure";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;

    const { sourceTermId, newTermName, startDate, endDate, copyFilters } = await req.json();

    if (!sourceTermId || !newTermName || !startDate || !endDate) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 1. Create new Term
    const newTerm = await Term.create({
      name: newTermName,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: false,
    });

    // 2. Fetch tenures from source term based on filters
    const filterQuery: any = { termId: sourceTermId, status: "ACTIVE" };
    if (copyFilters?.committeeIds?.length) {
      filterQuery.committeeId = { $in: copyFilters.committeeIds };
    }
    if (copyFilters?.roleType) {
      // Need to lookup roles to filter by roleType, or frontend passes roleIds
      if (copyFilters?.roleIds?.length) {
        filterQuery.roleId = { $in: copyFilters.roleIds };
      }
    }

    const sourceTenures = await TermTenure.find(filterQuery).lean();

    // 3. Duplicate Tenures to New Term
    const newTenures = sourceTenures.map((t: any) => ({
      memberId: t.memberId,
      termId: newTerm._id,
      committeeId: t.committeeId,
      roleId: t.roleId,
      status: "ACTIVE",
    }));

    if (newTenures.length > 0) {
      await TermTenure.insertMany(newTenures);
    }

    return NextResponse.json({
      message: `Successfully cloned term with ${newTenures.length} members.`,
      term: newTerm,
      count: newTenures.length,
    });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}
