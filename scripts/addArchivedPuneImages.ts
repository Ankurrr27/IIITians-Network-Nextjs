import fs from "fs";
import path from "path";
import mongoose from "mongoose";

// Load env
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
  }
} catch (e) {
  console.error("Failed to load .env file:", e);
}

import College from "../src/models/College";

const imagesToAdd = [
  {
    url: "https://raw.githubusercontent.com/IIITians-Network/IIIT-Pune/master/img/pune/slider_1.jpg",
    caption: "Main Academic Building and Campus Entrance - IIIT Pune (Archived)",
    category: "infrastructure" as const
  },
  {
    url: "https://raw.githubusercontent.com/IIITians-Network/IIIT-Pune/master/img/pune/slider_2.jpg",
    caption: "Hostel building and student housing - IIIT Pune (Archived)",
    category: "infrastructure" as const
  },
  {
    url: "https://raw.githubusercontent.com/IIITians-Network/IIIT-Pune/master/img/pune/slider_3.jpg",
    caption: "Lush green surrounding hills - IIIT Pune Campus (Archived)",
    category: "infrastructure" as const
  },
  {
    url: "https://raw.githubusercontent.com/IIITians-Network/IIIT-Pune/master/img/pune/1.jpg",
    caption: "Recreational sports area and campus ground - IIIT Pune (Archived)",
    category: "infrastructure" as const
  },
  {
    url: "https://raw.githubusercontent.com/IIITians-Network/IIIT-Pune/master/img/pune/3.jpeg",
    caption: "Students collaborating on coding projects - IIIT Pune (Archived)",
    category: "events" as const
  }
];

async function run() {
  const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!MONGODB_URI) {
    console.error("MONGODB_URI or MONGO_URI is missing.");
    process.exit(1);
  }

  console.log("Connecting to database...");
  await mongoose.connect(MONGODB_URI);

  // Find college
  let puneCollege = await College.findOne({ name: { $regex: /IIIT Pune/i } });
  
  if (!puneCollege) {
    console.log("IIIT Pune college document not found. Creating a new one...");
    puneCollege = await College.create({
      name: "IIIT Pune",
      website: "https://www.iiitp.ac.in/",
      description: "A Pune-based IIIT benefiting from a strong technology ecosystem and active student developer culture.",
      gallery: []
    });
  }

  console.log(`Current gallery count for IIIT Pune: ${puneCollege.gallery?.length || 0}`);

  if (!puneCollege.gallery) puneCollege.gallery = [];

  let addedCount = 0;
  for (const img of imagesToAdd) {
    const exists = puneCollege.gallery.some((g: any) => g.url === img.url);
    if (!exists) {
      puneCollege.gallery.push({
        url: img.url,
        caption: img.caption,
        category: img.category,
        createdAt: new Date()
      });
      addedCount++;
      console.log(`Added photo: ${img.url}`);
    }
  }

  if (addedCount > 0) {
    await puneCollege.save();
    console.log(`Successfully added ${addedCount} archived photos to IIIT Pune's gallery.`);
  } else {
    console.log("All archived photos already exist in IIIT Pune's gallery.");
  }

  await mongoose.disconnect();
  console.log("Disconnected.");
}

run().catch(console.error);
