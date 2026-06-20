// src/lib/auth.ts
// JWT helpers — server-side only.

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export interface AdminTokenPayload {
  id: string;
  role: "super_admin" | "admin";
  iat?: number;
  exp?: number;
}

export interface LegacyCertificateTokenPayload {
  id: string;
  email: string;
  kind: "legacy_certificate";
  iat?: number;
  exp?: number;
}

export function signToken(payload: Omit<AdminTokenPayload, "iat" | "exp">): string {
  if (!JWT_SECRET) throw new Error("JWT_SECRET not configured");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AdminTokenPayload | null {
  if (!JWT_SECRET) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
  } catch {
    return null;
  }
}

export function signLegacyCertificateToken(
  payload: Omit<LegacyCertificateTokenPayload, "iat" | "exp" | "kind">
): string {
  if (!JWT_SECRET) throw new Error("JWT_SECRET not configured");
  return jwt.sign({ ...payload, kind: "legacy_certificate" }, JWT_SECRET, {
    expiresIn: "2h",
  });
}

export function verifyLegacyCertificateToken(
  token: string
): LegacyCertificateTokenPayload | null {
  if (!JWT_SECRET) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as LegacyCertificateTokenPayload;
    if (decoded.kind !== "legacy_certificate") return null;
    return decoded;
  } catch {
    return null;
  }
}
