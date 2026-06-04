// src/lib/requireAdmin.ts
// Server-side helper to validate admin JWT from request headers.
// Returns the decoded payload on success, or a NextResponse error on failure.

import { NextRequest, NextResponse } from "next/server";
import { verifyToken, type AdminTokenPayload } from "./auth";

export function requireAdmin(
  req: NextRequest
): AdminTokenPayload | NextResponse {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const payload = verifyToken(auth.slice(7)) as any;
  if (!payload || (payload.role !== "super_admin" && payload.role !== "admin") || payload.kind) {
    return NextResponse.json(
      { message: "Unauthorized admin access" },
      { status: 401 }
    );
  }
  return payload;
}

export function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}
