import fs from "fs";
import path from "path";
import mongoose from "mongoose";

// Load .env variables manually
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    });
    console.log("Loaded .env file successfully.");
  } else {
    console.warn(".env file not found. Relying on system env.");
  }
} catch (e) {
  console.error("Failed to load .env file:", e);
}

// Now we can import our modules since path aliases are resolved by tsx
import Alumni from "../src/models/Alumni";
import TeamMember from "../src/models/TeamMember";
import {
  normalizeCollegeName,
  normalizeGeneration,
  normalizeBranch,
  normalizeGraduationYear,
} from "../src/lib/dataNormalization";

const applyChanges = process.argv.includes("--apply");

async function run() {
  const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI or MONGO_URI is not defined.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected successfully.\n");

  if (!applyChanges) {
    console.log("=========================================");
    console.log("         DRY RUN MODE (Read-only)        ");
    console.log("   Run with '--apply' to save changes    ");
    console.log("=========================================\n");
  } else {
    console.log("=========================================");
    console.log("             APPLYING CHANGES            ");
    console.log("=========================================\n");
  }

  // 1. Process Alumni Profiles
  console.log("--- Processing Alumni Profiles ---");
  const alumniList = await Alumni.find({});
  console.log(`Found ${alumniList.length} alumni profiles.`);

  let alumniUpdatedCount = 0;
  const emailsSeen = new Map<string, typeof alumniList[0][]>();

  for (const alumni of alumniList) {
    const email = alumni.email ? alumni.email.toLowerCase().trim() : "";
    if (email) {
      if (!emailsSeen.has(email)) {
        emailsSeen.set(email, []);
      }
      emailsSeen.get(email)!.push(alumni);
    }

    const originalIiit = alumni.iiit || "";
    const originalGen = alumni.generation || "";
    const originalBranch = alumni.branch || "";
    const originalGradYear = alumni.graduationYear;

    const normalizedIiit = normalizeCollegeName(originalIiit);
    const normalizedGen = normalizeGeneration(originalGen);
    const normalizedBranch = normalizeBranch(originalBranch);
    const normalizedGradYear = normalizeGraduationYear(originalGradYear, normalizedGen);

    const needsUpdate =
      originalIiit !== normalizedIiit ||
      originalGen !== normalizedGen ||
      originalBranch !== normalizedBranch ||
      originalGradYear !== normalizedGradYear;

    if (needsUpdate) {
      alumniUpdatedCount++;
      console.log(`\nProfile: ${alumni.name} (${alumni.email})`);
      if (originalIiit !== normalizedIiit) {
        console.log(`  College: "${originalIiit}" -> "${normalizedIiit}"`);
      }
      if (originalGen !== normalizedGen) {
        console.log(`  Generation: "${originalGen}" -> "${normalizedGen}"`);
      }
      if (originalBranch !== normalizedBranch) {
        console.log(`  Branch: "${originalBranch}" -> "${normalizedBranch}"`);
      }
      if (originalGradYear !== normalizedGradYear) {
        console.log(`  Grad Year: ${originalGradYear} -> ${normalizedGradYear}`);
      }

      if (applyChanges) {
        alumni.iiit = normalizedIiit;
        alumni.generation = normalizedGen;
        alumni.branch = normalizedBranch;
        alumni.graduationYear = normalizedGradYear;
        await alumni.save();
      }
    }
  }

  console.log(`\nAlumni processing completed. ${alumniUpdatedCount} profiles require changes.`);

  // Report duplicates
  console.log("\nChecking for duplicates...");
  let duplicateCount = 0;
  for (const [email, profiles] of emailsSeen.entries()) {
    if (profiles.length > 1) {
      duplicateCount++;
      console.log(`\n[WARNING] Duplicate email detected: ${email}`);
      profiles.forEach((p, idx) => {
        console.log(`  ${idx + 1}. ID: ${p._id} | Name: ${p.name} | College: ${p.iiit} | Status: ${p.status} | Created: ${p.createdAt}`);
      });
    }
  }
  console.log(`Total duplicate groups found: ${duplicateCount}`);

  // 2. Process Team Members
  console.log("\n--- Processing Team Members ---");
  const teamMembers = await TeamMember.find({});
  console.log(`Found ${teamMembers.length} team members.`);

  let teamUpdatedCount = 0;
  for (const member of teamMembers) {
    const originalIiit = member.iiit || "";
    const normalizedIiit = normalizeCollegeName(originalIiit);

    if (originalIiit !== normalizedIiit) {
      teamUpdatedCount++;
      console.log(`\nMember: ${member.name} (${member.email})`);
      console.log(`  College: "${originalIiit}" -> "${normalizedIiit}"`);

      if (applyChanges) {
        member.iiit = normalizedIiit;
        await member.save();
      }
    }
  }
  console.log(`\nTeam member processing completed. ${teamUpdatedCount} members require changes.`);

  console.log("\nDisconnecting from MongoDB...");
  await mongoose.disconnect();
  console.log("Done.");
}

run().catch((err) => {
  console.error("Migration script failed:", err);
  process.exit(1);
});
