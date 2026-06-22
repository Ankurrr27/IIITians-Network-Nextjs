// src/data/iiitDomains.ts
// Approved IIIT email domains for student/alumni verification.

export const IIIT_DOMAINS: string[] = [
  "iiit.ac.in",           // IIIT Hyderabad
  "iiitd.ac.in",          // IIIT Delhi
  "iiitdmj.ac.in",        // IIIT Jabalpur (IIITDM Jabalpur)
  "iiitdm.ac.in",         // IIITDM Kancheepuram
  "iiitranchi.ac.in",     // IIIT Ranchi
  "iiita.ac.in",          // IIIT Allahabad
  "iiitkota.ac.in",       // IIIT Kota
  "iiitl.ac.in",          // IIIT Lucknow
  "iiitbhopal.ac.in",     // IIIT Bhopal
  "iiitvadodara.ac.in",   // IIIT Vadodara
  "iiitg.ac.in",          // IIIT Guwahati
  "iiitk.ac.in",          // IIIT Kottayam
  "iiits.ac.in",          // IIIT Sri City
  "iiitn.ac.in",          // IIIT Nagpur
  "iiitdwd.ac.in",        // IIIT Dharwad
  "iiitkalyani.ac.in",    // IIIT Kalyani
  "iiitsonepat.ac.in",    // IIIT Sonepat
  "iiituna.ac.in",        // IIIT Una
  "iiitm.ac.in",          // IIIT Manipur
  "iiitp.ac.in",          // IIIT Pune
  "iiitr.ac.in",          // IIIT Raichur
  "iiitbh.ac.in",         // IIIT Bhagalpur
  "iiitag.ac.in",         // IIIT Agartala
  "iiitkrj.ac.in",        // IIIT Killyani (KRJ)
  "iiitsurat.ac.in",      // IIIT Surat
];

/**
 * Blocked personal-email domains — recruiters cannot use these to post.
 */
export const BLOCKED_RECRUITER_DOMAINS: string[] = [
  "gmail.com",
  "yahoo.com",
  "yahoo.in",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "aol.com",
  "protonmail.com",
  "icloud.com",
  "mail.com",
  "rediffmail.com",
  "ymail.com",
];

/**
 * Check if an email belongs to an approved IIIT domain.
 */
export function isIIITEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return IIIT_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`));
}

/**
 * Check if an email uses a blocked personal domain (for recruiter verification).
 */
export function isBlockedRecruiterEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return BLOCKED_RECRUITER_DOMAINS.includes(domain);
}
