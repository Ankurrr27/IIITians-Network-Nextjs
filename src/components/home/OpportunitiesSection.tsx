"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  GraduationCap,
  Github,
  Trophy,
  Building2,
  Rocket,
  ChevronRight,
  MapPin,
  ShieldCheck,
} from "lucide-react";

type Category = "Internships" | "Full-Time" | "Research" | "Open Source" | "Hackathons" | "Startups";

type Opportunity = {
  title: string;
  provider: string;
  location: string;
  details: string;
  linkText: string;
  link?: string;
  verified?: boolean;
};

export default function OpportunitiesSection() {
  const [activeTab, setActiveTab] = useState<Category>("Internships");

  const tabs: { name: Category; icon: React.ElementType }[] = [
    { name: "Internships", icon: Briefcase },
    { name: "Full-Time", icon: Building2 },
    { name: "Research", icon: GraduationCap },
    { name: "Open Source", icon: Github },
    { name: "Hackathons", icon: Trophy },
    { name: "Startups", icon: Rocket },
  ];

  const data: Record<Category, Opportunity[]> = {
    Internships: [
      { title: "Software Engineering Intern", provider: "Google", location: "Bengaluru / Hyderabad", details: "Work on core products with Google engineers. Requires strong DSA fundamentals, proficiency in C++, Java, or Python, and currently pursuing a B.Tech/M.Tech in CS or related field.", linkText: "Apply on Google Careers", link: "https://careers.google.com/", verified: true },
      { title: "Explore Program Intern", provider: "Microsoft", location: "Hyderabad / Bengaluru", details: "8-week internship program for first and second-year students. Explore Design, Build, and Quality roles across the software development cycle at Microsoft India.", linkText: "Apply on Microsoft Careers", link: "https://careers.microsoft.com/", verified: true },
      { title: "SDE Intern", provider: "Amazon", location: "Bengaluru / Hyderabad", details: "Build scalable software solutions at Amazon. Online assessment with 2 coding problems followed by technical interviews focused on DSA and system design fundamentals.", linkText: "Apply on Amazon Jobs", link: "https://www.amazon.jobs/en/", verified: true },
    ],
    "Full-Time": [
      { title: "Software Development Engineer", provider: "Flipkart", location: "Bengaluru", details: "Join Flipkart's engineering team to build India's largest e-commerce platform. Unique machine coding round testing modular, production-ready code under time pressure.", linkText: "View on Flipkart Careers", link: "https://www.flipkartcareers.com/", verified: true },
      { title: "Backend Engineer", provider: "Razorpay", location: "Bengaluru", details: "Build scalable payment infrastructure processing billions of transactions. Work on distributed systems, APIs, and financial technology powering India's digital economy.", linkText: "View on Razorpay Jobs", link: "https://razorpay.com/jobs/", verified: true },
      { title: "Software Engineer", provider: "PhonePe", location: "Bengaluru / Pune", details: "Build products serving 500M+ users on India's leading digital payments platform. Work on high-scale distributed systems, microservices, and real-time data pipelines.", linkText: "View on PhonePe Careers", link: "https://www.phonepe.com/careers/", verified: true },
    ],
    Research: [
      { title: "Project Research Assistant", provider: "IIT Bombay — IRCC", location: "Mumbai", details: "Work on sponsored research projects across Computer Science, AI/ML, and interdisciplinary labs. Contractual positions under Principal Investigators with stipend support.", linkText: "View on IIT Bombay", link: "https://www.ircc.iitb.ac.in/IRCC-Webpage/rnd/HRMSLoginPage.jsp", verified: true },
      { title: "Project Staff Positions", provider: "IIT Delhi — IRD Unit", location: "New Delhi", details: "Research and project staff positions funded by DST, DRDO, and internal grants. Roles in AI, NLP, Cryptography, VLSI, and more across IIT Delhi's research labs.", linkText: "View on IIT Delhi", link: "https://ird.iitd.ac.in/content/project-staff-positions", verified: true },
    ],
    "Open Source": [
      { title: "Google Summer of Code 2026", provider: "Google Open Source", location: "Remote / Global", details: "12-week paid open source program. Contribute to projects under mentoring organizations. Coding period: May 25 – Aug 24, 2026. Stipend provided by Google.", linkText: "Visit GSoC", link: "https://summerofcode.withgoogle.com/", verified: true },
      { title: "IIITians Network — Open Source", provider: "IIITians Network", location: "GitHub", details: "Contribute to the official IIITians Network portal. Work on Next.js, React, TypeScript, and MongoDB. Fix bugs, build features, and earn open source credit.", linkText: "GitHub Repo", link: "https://github.com/Ankurrr27/IIITians-Network-Nextjs", verified: true },
    ],
    Hackathons: [
      { title: "Smart India Hackathon 2026", provider: "Ministry of Education, Govt. of India", location: "Nationwide", details: "India's largest open innovation hackathon organized by MoE's Innovation Cell and AICTE. Internal college selection followed by national-level grand finale.", linkText: "Visit SIH Portal", link: "https://www.sih.gov.in/", verified: true },
      { title: "Flipkart GRiD 6.0", provider: "Flipkart", location: "Online + Bengaluru", details: "Flipkart's flagship engineering competition. Solve real-world e-commerce challenges in robotics, software dev, and information security. Serves as a hiring pipeline.", linkText: "Learn more", link: "https://unstop.com/hackathons/flipkart-grid-60", verified: true },
    ],
    Startups: [
      { title: "Software Engineer", provider: "CRED", location: "Bengaluru", details: "Build fintech products at one of India's most premium startups. Selective hiring for engineering roles in payments, rewards, and credit-tech. Strong DSA and system design expected.", linkText: "View on CRED Careers", link: "https://cred.club/careers", verified: true },
      { title: "Associate SDE", provider: "Swiggy", location: "Bengaluru / Remote", details: "Join Swiggy's engineering team building hyperlocal delivery and commerce platforms serving millions daily. Roles across backend, frontend, and platform engineering.", linkText: "View on Swiggy Careers", link: "https://careers.swiggy.com/", verified: true },
    ],
  };

  return (
    <section className="bg-slate-50/50 py-8 sm:py-16 border-y border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-baseline lg:justify-between gap-6">
          <div className="text-left">
            <h2 className="mt-0 sm:mt-4 text-xl sm:text-4xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-slate-100">
              Explore{" "}
              <span className="text-indigo-600"> Opportunities</span>
            </h2>
            
            {/* Desktop Tabs */}
            <div className="mt-4 sm:mt-6 hidden sm:flex flex-wrap gap-1.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.name;
                return (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`flex items-center gap-1.5 rounded-3xl px-3.5 py-1.5 text-xs font-extrabold transition-all duration-200 active:scale-95 ${
                      isActive
                        ? "bg-indigo-600 text-white shadow shadow-indigo-500/20"
                        : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Global CTA (Moved to top on desktop, bottom on mobile) */}
          <div className="hidden sm:flex flex-col sm:items-start lg:items-end gap-4 sm:gap-6 px-4 sm:px-0">
            <Link
              href="/opportunities"
              className="inline-flex justify-center w-full sm:w-auto items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-95"
            >
              Explore the Talent Marketplace
              <ChevronRight size={16} className="text-slate-400" />
            </Link>
            <p className="text-[11px] sm:text-xs text-slate-500 font-semibold text-left lg:text-right leading-relaxed">
              Are you a recruiter?{" "}
              <Link href="/opportunities?post=true" className="text-indigo-600 hover:text-indigo-700 transition">
                Post opportunities
              </Link>{" "}
              to reach all IIITs.
            </p>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <div className="mt-3 sm:hidden px-4">
          <div className="relative">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as Category)}
              className="block w-full appearance-none rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {tabs.map((tab) => (
                <option key={tab.name} value={tab.name}>
                  {tab.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tab content listings */}
        <div className="mt-4 sm:mt-8 grid gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 -mx-4 sm:mx-0">
          {data[activeTab].map((opp, index) => (
            <div
              key={index}
              className="flex flex-col justify-between sm:rounded-xl border-y sm:border-y-0 sm:border border-slate-200/80 bg-white px-4 py-3.5 sm:p-6 shadow-sm transition hover:shadow-md hover:border-slate-300 duration-200"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                    {activeTab}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                    <MapPin size={10} />
                    {opp.location}
                  </span>
                  {opp.verified && (
                    <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                      <ShieldCheck size={10} />
                      Verified
                    </span>
                  )}
                </div>
                <h3 className="mt-2 sm:mt-4 text-sm sm:text-base font-extrabold text-slate-950 tracking-tight">{opp.title}</h3>
                <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wide mt-0.5">{opp.provider}</p>
                <p className="mt-2 sm:mt-3.5 text-xs sm:text-sm leading-relaxed text-slate-600 font-medium line-clamp-3 sm:line-clamp-none">
                  {opp.details}
                </p>
              </div>

              <div className="mt-3 sm:mt-6 border-t border-slate-100 pt-2.5 sm:pt-4 flex justify-end">
                {opp.link ? (
                  <a
                    href={opp.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
                  >
                    {opp.linkText}
                    <ChevronRight size={14} />
                  </a>
                ) : (
                  <Link
                    href="/opportunities"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
                  >
                    {opp.linkText}
                    <ChevronRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Global CTA */}
        <div className="flex sm:hidden flex-col items-start gap-2.5 mt-5 px-4">
          <Link
            href="/opportunities"
            className="inline-flex justify-between w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-95"
          >
            <span>Explore the Talent Marketplace</span>
            <ChevronRight size={14} className="text-slate-400 shrink-0" />
          </Link>
          <p className="text-[11px] text-slate-500 font-semibold text-left leading-relaxed">
            Are you a recruiter?{" "}
            <Link href="/opportunities?post=true" className="text-indigo-600 hover:text-indigo-700 transition">
              Post opportunities
            </Link>{" "}
            to reach all IIITs.
          </p>
        </div>
      </div>
    </section>
  );
}
