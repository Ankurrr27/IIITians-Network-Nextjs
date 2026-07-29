import { MetadataRoute } from "next";
import connectDB from "@/lib/mongoose";
import College from "@/models/College";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.iiitiansnetwork.in";

  // Define static pages with SEO frequency & priority
  const staticPages = [
    { path: "", changefreq: "daily" as const, priority: 1.0 },
    { path: "/colleges", changefreq: "weekly" as const, priority: 0.9 },
    { path: "/placement", changefreq: "weekly" as const, priority: 0.8 },
    { path: "/events", changefreq: "daily" as const, priority: 0.9 },
    { path: "/discuss", changefreq: "daily" as const, priority: 0.9 },
    { path: "/legacy", changefreq: "weekly" as const, priority: 0.8 },
    { path: "/team", changefreq: "monthly" as const, priority: 0.7 },
    { path: "/team/join", changefreq: "monthly" as const, priority: 0.6 },
    { path: "/contact", changefreq: "yearly" as const, priority: 0.5 },
    { path: "/guide", changefreq: "monthly" as const, priority: 0.7 },
    { path: "/merchandise", changefreq: "weekly" as const, priority: 0.8 },
    { path: "/opportunities", changefreq: "daily" as const, priority: 0.8 },
    { path: "/gallery", changefreq: "weekly" as const, priority: 0.8 },
    { path: "/profile", changefreq: "monthly" as const, priority: 0.6 },
    { path: "/alumni", changefreq: "weekly" as const, priority: 0.8 },
    { path: "/club/register", changefreq: "monthly" as const, priority: 0.6 },
    { path: "/legacy/certificate", changefreq: "monthly" as const, priority: 0.6 },
  ];

  const entries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changefreq,
    priority: page.priority,
  }));

  // Dynamic College sub-routes
  try {
    await connectDB();
    const colleges = await College.find({}, "name").lean();
    
    for (const college of colleges) {
      if (college && college.name) {
        const encodeName = encodeURIComponent(college.name);
        
        // College Gallery
        entries.push({
          url: `${baseUrl}/college/${encodeName}/gallery`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        });

        // College Clubs
        entries.push({
          url: `${baseUrl}/college/${encodeName}/clubs`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        });

        // College Placements query path
        entries.push({
          url: `${baseUrl}/placement?college=${encodeName}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  } catch (error) {
    console.error("Error generating dynamic sitemap entries for colleges:", error);
  }

  return entries;
}
