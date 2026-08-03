/**
 * Data normalization utilities for standardizing profile metadata
 * across the IIITians Network (college names, batch years, branches).
 *
 * Every normalizer is a pure function: string in → string out.
 * Import these in API routes and migration scripts.
 */

import { iiitCampuses } from "@/data/iiitCampuses";

// ────────────────────────────────────────────────────────────────
// 1. College / Institute Name Normalization
// ────────────────────────────────────────────────────────────────

/** Known aliases that don't follow a regular pattern. */
const COLLEGE_ALIASES: Record<string, string> = {
  // Sri City / Chittoor variations
  sricity: "IIIT Sri City",
  "sri city": "IIIT Sri City",
  chittoor: "IIIT Sri City",
  sricityap: "IIIT Sri City",

  // Gwalior variations
  gwalior: "ABV-IIITM Gwalior",
  abviiitmgwalior: "ABV-IIITM Gwalior",
  abviiitm: "ABV-IIITM Gwalior",
  iiitmgwalior: "ABV-IIITM Gwalior",

  // Jabalpur
  jabalpur: "IIITDM Jabalpur",
  iiitdmjabalpur: "IIITDM Jabalpur",

  // Kancheepuram / Chennai
  kancheepuram: "IIITDM Kancheepuram",
  kanchipuram: "IIITDM Kancheepuram",
  iiitdmkancheepuram: "IIITDM Kancheepuram",
  iiitdmchennai: "IIITDM Kancheepuram",

  // Kurnool
  kurnool: "IIITDM Kurnool",
  iiitdmkurnool: "IIITDM Kurnool",

  // Hyderabad
  hyderabad: "IIIT Hyderabad",
  iiith: "IIIT Hyderabad",

  // Bangalore
  bangalore: "IIIT Bangalore",
  bengaluru: "IIIT Bangalore",
  iiitb: "IIIT Bangalore",

  // Delhi
  delhi: "IIIT Delhi",
  iiitd: "IIIT Delhi",
  newdelhi: "IIIT Delhi",

  // Bhubaneswar
  bhubaneswar: "IIIT Bhubaneswar",
  bbsr: "IIIT Bhubaneswar",

  // Naya Raipur
  nayaraipur: "IIIT Naya Raipur",
  navaraipur: "IIIT Naya Raipur",
  raipur: "IIIT Naya Raipur",

  // Tiruchirappalli
  tiruchirappalli: "IIIT Tiruchirappalli",
  trichy: "IIIT Tiruchirappalli",
  tiruchirapalli: "IIIT Tiruchirappalli",

  // Vadodara / Diu
  vadodaradiu: "IIIT Vadodara International Campus Diu",
  diu: "IIIT Vadodara International Campus Diu",
  icdiu: "IIIT Vadodara International Campus Diu",

  // Sonipat / Sonepat
  sonipat: "IIIT Sonipat",
  sonepat: "IIIT Sonipat",

  // Allahabad / Prayagraj
  allahabad: "IIIT Allahabad",
  prayagraj: "IIIT Allahabad",
  iiita: "IIIT Allahabad",
};

/**
 * Build a lookup from lowercased, stripped campus name → canonical name.
 * This runs once at module load time.
 */
function buildCampusLookup(): Map<string, string> {
  const map = new Map<string, string>();

  for (const campus of iiitCampuses) {
    const canonical = campus.name;
    const stripped = stripNoise(canonical);
    map.set(stripped, canonical);

    // Also index by city (lowercased)
    const cityKey = campus.city.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!map.has(cityKey)) {
      map.set(cityKey, canonical);
    }

    // Index by id slug (e.g. "iiit-kota")
    const idKey = campus.id.replace(/-/g, "");
    if (!map.has(idKey)) {
      map.set(idKey, canonical);
    }
  }

  // Add manual aliases
  for (const [alias, canonical] of Object.entries(COLLEGE_ALIASES)) {
    map.set(alias.replace(/[^a-z0-9]/g, ""), canonical);
  }

  return map;
}

/** Remove common prefixes, hyphens, spaces, convert to lowercase alphanumeric. */
function stripNoise(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); // remove all non-alphanumeric
}

const campusLookup = buildCampusLookup();

/**
 * Normalize a college / institute name to its canonical form.
 * Returns the canonical name if a match is found, otherwise returns
 * the trimmed original (preserving case) for manual review.
 *
 * @example
 *   normalizeCollegeName("iiit kota")         → "IIIT Kota"
 *   normalizeCollegeName("IIIT-Kota")         → "IIIT Kota"
 *   normalizeCollegeName("IIITDM jabalpur")   → "IIITDM Jabalpur"
 *   normalizeCollegeName("iiit sri city")      → "IIIT Sri City"
 *   normalizeCollegeName("Some Random College") → "Some Random College" (unchanged)
 */
export function normalizeCollegeName(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  const key = stripNoise(trimmed);

  // Direct lookup
  if (campusLookup.has(key)) {
    return campusLookup.get(key)!;
  }

  // Try stripping common prefixes for city-only input: "iiit", "iiitdm", "abv"
  const cityOnly = key
    .replace(/^abviiitm/, "")
    .replace(/^iiitdm/, "")
    .replace(/^iiit/, "");

  if (cityOnly && campusLookup.has(cityOnly)) {
    return campusLookup.get(cityOnly)!;
  }

  // No match — return the original trimmed value
  return trimmed;
}

// ────────────────────────────────────────────────────────────────
// 2. Generation / Batch Normalization
// ────────────────────────────────────────────────────────────────

/**
 * Normalize a generation/batch string to the canonical `YYYY-YY` format.
 *
 * Handles:
 *   "2024-2028"  → "2024-28"
 *   "2024-28"    → "2024-28" (already correct)
 *   "Batch 2024-28" → "2024-28"
 *   "24-28"      → "2024-28"
 *   "2024"       → "2024-28" (assumes 4-year program)
 *   "batch 2021" → "2021-25"
 *
 * Returns trimmed original if it can't be parsed.
 */
export function normalizeGeneration(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  // Extract all 2- or 4-digit year-like numbers
  const yearMatches = trimmed.match(/\d{2,4}/g);
  if (!yearMatches || yearMatches.length === 0) return trimmed;

  // Parse the first number as the start year
  let startYear = parseInt(yearMatches[0], 10);

  // If 2-digit, expand to 4-digit (assume 2000s)
  if (startYear < 100) {
    startYear += 2000;
  }

  // Validate range
  if (startYear < 1990 || startYear > 2100) return trimmed;

  // If there's a second number, use it as end year
  if (yearMatches.length >= 2) {
    let endYear = parseInt(yearMatches[1], 10);

    // If 2-digit, expand
    if (endYear < 100) {
      endYear += 2000;
    }

    // Validate that end > start and the gap is reasonable (1-6 years)
    const gap = endYear - startYear;
    if (gap >= 1 && gap <= 6) {
      return `${startYear}-${String(endYear).slice(-2)}`;
    }
  }

  // Only one number — assume 4-year program
  const endYear = startYear + 4;
  return `${startYear}-${String(endYear).slice(-2)}`;
}

// ────────────────────────────────────────────────────────────────
// 3. Branch Normalization
// ────────────────────────────────────────────────────────────────

/** Map of common variations → standard abbreviation. */
const BRANCH_MAP: Record<string, string> = {
  // CSE
  cse: "CSE",
  cs: "CSE",
  "computer science": "CSE",
  "computer science and engineering": "CSE",
  "computer science & engineering": "CSE",
  "computer science engineering": "CSE",
  "comp sci": "CSE",

  // ECE
  ece: "ECE",
  "electronics and communication": "ECE",
  "electronics & communication": "ECE",
  "electronics and communication engineering": "ECE",
  "electronics & communication engineering": "ECE",
  "electronics communication": "ECE",

  // IT
  it: "IT",
  "information technology": "IT",
  "info tech": "IT",

  // EE / EEE
  ee: "EE",
  eee: "EEE",
  "electrical engineering": "EE",
  "electrical and electronics engineering": "EEE",
  "electrical & electronics engineering": "EEE",
  "electrical and electronics": "EEE",

  // ME
  me: "ME",
  "mechanical engineering": "ME",
  mechanical: "ME",

  // Design
  "b.des": "B.Des",
  bdes: "B.Des",
  design: "B.Des",

  // CSE specializations (keep as-is with standard prefix)
  "cse ai": "CSE (AI)",
  "cse-ai": "CSE (AI)",
  "cse artificial intelligence": "CSE (AI)",
  "computer science ai": "CSE (AI)",
  "cse ai ml": "CSE (AI & ML)",
  "cse ai/ml": "CSE (AI & ML)",
  "cse data science": "CSE (Data Science)",
  "cse ds": "CSE (Data Science)",
  "cse cyber security": "CSE (Cyber Security)",
  "cse cybersecurity": "CSE (Cyber Security)",

  // Smart Manufacturing
  "smart manufacturing": "Smart Manufacturing",
  sm: "Smart Manufacturing",

  // DSAI
  dsai: "DSAI",
  "data science and ai": "DSAI",
  "data science and artificial intelligence": "DSAI",
  "data science & ai": "DSAI",
  "data science & artificial intelligence": "DSAI",

  // MBA
  mba: "MBA",
};

/**
 * Normalize a branch name to its standard abbreviation.
 * Returns the matched abbreviation if found, otherwise trims and
 * title-cases the original for consistency.
 *
 * @example
 *   normalizeBranch("computer science and engineering") → "CSE"
 *   normalizeBranch("cse") → "CSE"
 *   normalizeBranch("ECE") → "ECE"
 *   normalizeBranch("Some New Branch") → "Some New Branch"
 */
export function normalizeBranch(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  const key = trimmed.toLowerCase();

  if (BRANCH_MAP[key]) {
    return BRANCH_MAP[key];
  }

  // Try stripping dots and extra spaces
  const cleaned = key.replace(/\./g, "").replace(/\s+/g, " ");
  if (BRANCH_MAP[cleaned]) {
    return BRANCH_MAP[cleaned];
  }

  // If it's already a short abbreviation (2-4 uppercase chars), keep it
  if (/^[A-Z]{2,5}$/.test(trimmed)) {
    return trimmed;
  }

  // Return the trimmed original — don't force a match
  return trimmed;
}

// ────────────────────────────────────────────────────────────────
// 4. Graduation Year Validation
// ────────────────────────────────────────────────────────────────

/**
 * Validate and optionally infer graduation year.
 * If `generation` is provided and contains a valid end year, use it.
 */
export function normalizeGraduationYear(
  raw: number | string,
  generation?: string
): number {
  const year = typeof raw === "string" ? parseInt(raw, 10) : raw;

  // If valid, return as-is
  if (!isNaN(year) && year >= 2000 && year <= 2100) {
    return year;
  }

  // Try to infer from generation
  if (generation) {
    const match = generation.match(/\d{2,4}$/);
    if (match) {
      let endYear = parseInt(match[0], 10);
      if (endYear < 100) endYear += 2000;
      if (endYear >= 2000 && endYear <= 2100) return endYear;
    }
  }

  return year; // return original even if invalid — model validation will catch it
}

// ────────────────────────────────────────────────────────────────
// 5. Full Profile Normalizer (convenience)
// ────────────────────────────────────────────────────────────────

/**
 * Apply all normalizations to a profile payload object.
 * Mutates nothing — returns a new object with normalized fields.
 */
export function normalizeProfileFields<
  T extends {
    iiit?: string;
    generation?: string;
    branch?: string;
    graduationYear?: number | string;
  }
>(payload: T): T {
  const result = { ...payload };

  if (result.iiit) {
    result.iiit = normalizeCollegeName(result.iiit);
  }

  if (result.generation) {
    result.generation = normalizeGeneration(result.generation);
  }

  if (result.branch) {
    result.branch = normalizeBranch(result.branch);
  }

  if (result.graduationYear !== undefined) {
    result.graduationYear = normalizeGraduationYear(
      result.graduationYear,
      result.generation
    );
  }

  return result;
}

// ────────────────────────────────────────────────────────────────
// 6. Standard Branch & College lists (for frontend dropdowns)
// ────────────────────────────────────────────────────────────────

/** Standard branch options for form dropdowns. */
export const STANDARD_BRANCHES = [
  "CSE",
  "CSE (AI)",
  "CSE (AI & ML)",
  "CSE (Data Science)",
  "CSE (Cyber Security)",
  "ECE",
  "EE",
  "EEE",
  "IT",
  "ME",
  "DSAI",
  "B.Des",
  "Smart Manufacturing",
  "MBA",
] as const;

/** Canonical college names from the campus list. */
export const CANONICAL_COLLEGES = iiitCampuses.map((c) => c.name);
