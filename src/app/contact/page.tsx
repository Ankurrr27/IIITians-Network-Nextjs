"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import useThemeMode from "@/hooks/useThemeMode";
import {
  ArrowRight,
  Hash,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck,
  Youtube,
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
};

// Custom Reusable Collaboration / Event Coverage Card Component
interface CollaborateCardProps {
  title: string;
  description: string;
  ctaText: string;
  mailSubject: string;
  isDarkMode: boolean;
}

function CollaborateCard({ title, description, ctaText, mailSubject, isDarkMode }: CollaborateCardProps) {
  const emailHref = `mailto:iiitiansnetwork@gmail.com?subject=${encodeURIComponent(mailSubject)}`;
  return (
    <div
      className={`rounded-[1.8rem] border p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
        isDarkMode
          ? "border-slate-800 bg-slate-900/40 text-slate-100 hover:border-slate-700 hover:shadow-[0_20px_50px_rgba(99,102,241,0.05)]"
          : "border-slate-200 bg-white text-slate-900 hover:border-indigo-100 hover:shadow-[0_20px_50px_rgba(79,70,229,0.04)] shadow-sm"
      }`}
    >
      <div>
        <h3 className={`text-xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          {title}
        </h3>
        <p className={`mt-2.5 text-sm leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600 font-semibold"}`}>
          {description}
        </p>
      </div>
      <div className="mt-6">
        <a
          href={emailHref}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-500/20"
        >
          {ctaText}
          <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
}

// Custom Reusable Social Media Lead Card
interface SocialLeadCardProps {
  name: string;
  platform: string;
  linkedin: string;
  photoUrl?: string;
  isDarkMode: boolean;
}

function SocialLeadCard({ name, platform, linkedin, photoUrl, isDarkMode }: SocialLeadCardProps) {
  return (
    <div
      className={`group flex items-center gap-3.5 rounded-2xl border p-3.5 transition-all duration-300 hover:-translate-y-0.5 ${
        isDarkMode
          ? "border-slate-800 bg-slate-900/30 text-slate-100 hover:border-slate-700 hover:shadow-[0_10px_30px_rgba(99,102,241,0.04)]"
          : "border-slate-200 bg-white text-slate-900 hover:border-indigo-100 hover:shadow-[0_10px_30px_rgba(79,70,229,0.03)] shadow-sm"
      }`}
    >
      <div className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 transition-all duration-300 ${
        isDarkMode ? "ring-slate-800 group-hover:ring-slate-700" : "ring-indigo-50 group-hover:ring-indigo-100"
      }`}>
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="44px"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-black text-white uppercase tracking-wider">
            {name[0]}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className={`text-xs font-extrabold truncate ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          {name}
        </h4>
        <p className={`text-[10px] font-semibold mt-0.5 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`}>
          {platform}
        </p>
      </div>

      <a
        href={linkedin}
        target="_blank"
        rel="noreferrer"
        title={`${name} on LinkedIn`}
        className="text-slate-400 hover:text-indigo-500 transition-colors duration-200 p-1.5 rounded-lg hover:bg-slate-500/5"
      >
        <Linkedin className="h-4 w-4" />
      </a>
    </div>
  );
}

// Custom Reusable Developer Profile Card
interface ProfileCardProps {
  name: string;
  role: string;
  iiit: string;
  linkedin: string;
  photoUrl?: string;
  isDarkMode: boolean;
}

function ProfileCard({ name, role, iiit, linkedin, photoUrl, isDarkMode }: ProfileCardProps) {
  return (
    <article
      className={`group flex flex-col items-center rounded-2xl border p-5 text-center transition-all duration-300 hover:-translate-y-1 ${
        isDarkMode
          ? "border-slate-800 bg-slate-900/40 text-slate-100 hover:border-slate-700 hover:shadow-[0_20px_50px_rgba(99,102,241,0.05)]"
          : "border-slate-200 bg-white text-slate-900 hover:border-indigo-100 hover:shadow-[0_20px_50px_rgba(79,70,229,0.04)] shadow-sm"
      }`}
    >
      <div className={`relative h-20 w-20 overflow-hidden rounded-full ring-4 transition-all duration-300 shadow-inner ${
        isDarkMode ? "ring-slate-800 group-hover:ring-slate-700" : "ring-indigo-50 group-hover:ring-indigo-100"
      }`}>
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="80px"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-black text-white uppercase tracking-wider">
            {name[0]}
          </div>
        )}
      </div>

      <h3 className={`mt-4 text-sm font-extrabold transition-colors ${
        isDarkMode ? "text-white group-hover:text-indigo-400" : "text-slate-900 group-hover:text-indigo-600"
      }`}>
        {name}
      </h3>
      <p className={`mt-0.5 text-xs font-semibold ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`}>
        {role}
      </p>
      <p className="mt-1 text-[10px] text-slate-400 font-semibold tracking-wide uppercase">
        {iiit}
      </p>

      <div className={`mt-4 flex w-full justify-center border-t pt-3 ${
        isDarkMode ? "border-slate-800" : "border-slate-100"
      }`}>
        <a
          href={linkedin}
          target="_blank"
          rel="noreferrer"
          title={`${name} on LinkedIn`}
          className="text-slate-400 hover:text-indigo-500 transition-colors duration-200"
        >
          <Linkedin className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}

export default function ContactPage() {
  const { isDarkMode } = useThemeMode();

  const socialLinks = [
    {
      name: "Email",
      icon: <Mail size={18} />,
      link: "mailto:iiitiansnetwork@gmail.com",
      tone: "hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700",
    },
    {
      name: "Instagram",
      icon: <Instagram size={18} />,
      link: "https://www.instagram.com/iiitiansnetwork",
      tone: "hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600",
    },
    {
      name: "Telegram",
      icon: <Send size={18} />,
      link: "#",
      tone: "hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600",
    },
    {
      name: "LinkedIn",
      icon: <Linkedin size={18} />,
      link: "https://www.linkedin.com/company/iiitians-network/",
      tone: "hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700",
    },
    {
      name: "Discord",
      icon: <MessageCircle size={18} />,
      link: "https://discord.gg/88AnpuNc6E",
      tone: "hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600",
    },
    {
      name: "Reddit",
      icon: <Hash size={18} />,
      link: "https://www.reddit.com/r/iiitiansnetwork_/s/raoRbgEdX6",
      tone: "hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600",
    },
    {
      name: "YouTube",
      icon: <Youtube size={18} />,
      link: "https://youtube.com/@iiitiansnetwork?si=8ytWXimIsJt2qJeF",
      tone: "hover:border-red-200 hover:bg-red-50 hover:text-red-600",
    },
  ];

  const contactCards = [
    {
      title: "Official Email",
      subtitle: "Verification, collaboration, and general inquiries",
      href: "mailto:iiitiansnetwork@gmail.com",
      icon: <Mail size={22} className={isDarkMode ? "text-indigo-400" : "text-indigo-600"} />,
      cta: "Mail us",
    },
    {
      title: "Instagram",
      subtitle: "Community updates, highlights, and latest activity",
      href: "https://www.instagram.com/iiitiansnetwork",
      icon: <Instagram size={22} className={isDarkMode ? "text-pink-400" : "text-pink-600"} />,
      cta: "View profile",
    },
    {
      title: "Transparency",
      subtitle: "Public information bridge with clear and verified outreach",
      icon: <ShieldCheck size={22} className={isDarkMode ? "text-emerald-400" : "text-emerald-600"} />,
      static: true,
    },
  ];

  const developers = [
    {
      name: "Varun Raj",
      role: "Senior Developer",
      iiit: "IIIT Ranchi",
      linkedin: "https://www.linkedin.com/in/varun-raj-85592b324?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      photoUrl: "https://res.cloudinary.com/iiitians-network/image/upload/v1776864098/colleges/dfyj49a97tb8naiolnts.jpg"
    },
    {
      name: "Yash Kapoor",
      role: "Development Team",
      iiit: "IIIT Ranchi",
      linkedin: "https://www.linkedin.com/in/yash-kapoor-a17026251?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      photoUrl: "https://res.cloudinary.com/iiitians-network/image/upload/v1775327750/colleges/deyeldaslh5rbqhxddfq.jpg"
    },
    {
      name: "Ankur Singh",
      role: "Vice President",
      iiit: "IIIT Kota",
      linkedin: "https://www.linkedin.com/in/ankurrr27/",
      photoUrl: "https://res.cloudinary.com/iiitians-network/image/upload/v1775170056/colleges/gmhe0vo8mj9tvyg3halt.jpg"
    }
  ];

  const socialLeads = [
    {
      name: "Shikhar Asthana",
      platform: "Overall Lead",
      linkedin: "https://www.linkedin.com/in/shikhar-asthana-6407b1378?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      photoUrl: "https://res.cloudinary.com/iiitians-network/image/upload/v1766066512/team-members/zhnad5fapcdqgymaff7b.png"
    },
    {
      name: "Raghav Mehra",
      platform: "Instagram Admin",
      linkedin: "https://www.linkedin.com/in/raghav-mehra-233b1b325?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      photoUrl: "https://res.cloudinary.com/iiitians-network/image/upload/v1775285848/colleges/kem2mc3qqq7f5cjdxmxq.jpg"
    },
    {
      name: "Sarthak Yash Kumar",
      platform: "LinkedIn Admin",
      linkedin: "https://www.linkedin.com/in/sarthak-yash-kumar-915608360?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      photoUrl: "https://res.cloudinary.com/iiitians-network/image/upload/v1766066744/team-members/diy9zvzyet9y0ujhkqww.jpg"
    },
    {
      name: "Krushna Mali",
      platform: "X / Twitter Admin",
      linkedin: "https://www.linkedin.com/in/krushna-mali-4583b0370?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      photoUrl: "https://res.cloudinary.com/iiitians-network/image/upload/v1775326689/colleges/rh25vgvljvgpruvnyumb.jpg"
    },
    {
      name: "Gauransh Sattavan",
      platform: "Discord Admin",
      linkedin: "https://www.linkedin.com/in/gauransh57?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
      photoUrl: "https://res.cloudinary.com/iiitians-network/image/upload/v1766067136/team-members/ldknn3nayqjp3cn72cbp.png"
    },
    {
      name: "Rudraksh Gupta",
      platform: "Reddit & Forums Admin",
      linkedin: "https://www.linkedin.com/in/rudrakshgupta-02388921b?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      photoUrl: "https://res.cloudinary.com/iiitians-network/image/upload/v1766594703/team-members/svfstmelzzft20sjtjgd.jpg"
    }
  ];

  return (
    <div className={`relative min-h-screen pb-14 pt-24 transition-colors duration-300 sm:pb-20 sm:pt-28 ${
      isDarkMode
        ? "bg-[linear-gradient(180deg,_#090d16_0%,_#0d1424_40%,_#0a0a0a_100%)] text-slate-100"
        : "bg-[linear-gradient(180deg,_#eff6ff_0%,_#f8faff_40%,_#ffffff_100%)] text-slate-900"
    }`}>
      {/* Radial Gradient Overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_0_22%),radial-gradient(circle_at_80%_18%,rgba(125,211,252,0.18),transparent_0_20%),radial-gradient(circle_at_72%_72%,rgba(96,165,250,0.12),transparent_0_24%)]" />

      {/* Main Header Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 mx-auto max-w-7xl px-4 sm:px-5 lg:px-6"
      >
        <div className="mb-6">
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] backdrop-blur-md transition-colors duration-300 ${
            isDarkMode
              ? "border-indigo-900/30 bg-slate-900/80 text-indigo-400"
              : "border-indigo-100 bg-white/80 text-indigo-700"
          }`}>
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Official Channels
          </div>

          <div className="mt-4 grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <h1 className={`mt-3 text-2xl font-semibold tracking-tight sm:text-4xl ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                Contact The <span className={isDarkMode ? "text-indigo-400 font-semibold" : "text-indigo-600 font-semibold"}>IIITians Network</span>
              </h1>
              <p className={`mt-3 max-w-2xl text-sm font-medium leading-6 ${isDarkMode ? "text-slate-400" : "text-slate-600 font-semibold"}`}>
                Reach the network through verified public channels for updates,
                collaboration, and community coordination across IIIT campuses.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className={`rounded-xl border px-4 py-3 shadow-sm backdrop-blur-md transition-all duration-300 ${
                isDarkMode
                  ? "border-slate-800 bg-slate-900/40 text-slate-100"
                  : "border-slate-200 bg-white/70 text-slate-800"
              }`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Best For
                </p>
                <p className={`mt-2 text-sm font-semibold ${isDarkMode ? "text-slate-300" : "text-slate-800"}`}>
                  Official outreach, student queries, and updates
                </p>
              </div>
              <div className={`rounded-xl border px-4 py-3 shadow-sm backdrop-blur-md transition-all duration-300 ${
                isDarkMode
                  ? "border-slate-800 bg-slate-900/40 text-slate-100"
                  : "border-slate-200 bg-white/70 text-slate-800"
              }`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Response Path
                </p>
                <p className={`mt-2 text-sm font-semibold ${isDarkMode ? "text-slate-300" : "text-slate-800"}`}>
                  Email first, social platforms for visibility
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Grid Content Sections */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto mt-6 max-w-7xl px-4 sm:px-5 lg:px-6 space-y-10"
      >
        {/* Core Contact Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {contactCards.map((card) =>
            card.static ? (
              <motion.div
                key={card.title}
                variants={item}
                className={`rounded-[1.15rem] border p-4 shadow-sm sm:p-5 transition-all duration-300 ${
                  isDarkMode
                    ? "border-emerald-950/30 bg-emerald-950/20 text-emerald-100"
                    : "border-emerald-100 bg-emerald-50/70 text-slate-900"
                }`}
              >
                {card.icon}
                <h2 className={`mt-4 text-xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                  {card.title}
                </h2>
                <p className={`mt-2 text-sm leading-7 font-semibold ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                  {card.subtitle}
                </p>
              </motion.div>
            ) : (
              <motion.a
                key={card.title}
                variants={item}
                href={card.href || "#"}
                target={card.href?.startsWith("http") ? "_blank" : undefined}
                rel={card.href?.startsWith("http") ? "noreferrer" : undefined}
                className={`group rounded-[1.15rem] border p-4 shadow-sm transition hover:-translate-y-0.5 sm:p-5 ${
                  isDarkMode
                    ? "border-slate-800 bg-slate-900/60 hover:border-indigo-500/40 hover:shadow-[0_20px_50px_rgba(99,102,241,0.15)] text-slate-100"
                    : "border-slate-200 bg-white hover:border-indigo-200 hover:shadow-[0_20px_50px_rgba(79,70,229,0.08)] text-slate-900"
                }`}
              >
                {card.icon}
                <h2 className={`mt-4 text-xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                  {card.title}
                </h2>
                <p className={`mt-2 text-sm leading-7 font-semibold ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                  {card.subtitle}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {card.cta}
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </motion.a>
            )
          )}
        </div>

        {/* Collaborate & Event Coverage Sections */}
        <motion.div variants={item} className="grid gap-6 md:grid-cols-2">
          <CollaborateCard
            title="Want Your Event to Get Covered?"
            description="If you're organizing a hackathon, fest, workshop, webinar, conference, or community event across any IIIT, we'd love to feature it through the IIITians Network."
            ctaText="Request Coverage"
            mailSubject="Event Coverage Request"
            isDarkMode={isDarkMode}
          />
          <CollaborateCard
            title="Collaborate With Us"
            description="Want to publish articles, share opportunities, showcase projects, conduct interviews, or contribute content to the IIIT community? Let's collaborate."
            ctaText="Start Collaboration"
            mailSubject="Content Collaboration Request"
            isDarkMode={isDarkMode}
          />
        </motion.div>

        {/* Social Media Leads Section */}
        <motion.div variants={item} className="space-y-4">
          <div className="border-l-4 border-indigo-600 pl-4">
            <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Connect With Our Social Media Team
            </h2>
            <p className={`mt-1 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600 font-semibold"}`}>
              Allow brands, startups, student clubs, and organizations to connect directly with social media leads.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {socialLeads.map((lead) => (
              <SocialLeadCard
                key={lead.name}
                name={lead.name}
                platform={lead.platform}
                linkedin={lead.linkedin}
                photoUrl={lead.photoUrl}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </motion.div>

        {/* Follow the Network (Social Links) */}
        <motion.div
          variants={item}
          className={`mt-5 rounded-[1.25rem] border p-4 shadow-sm sm:p-5 transition-all duration-300 ${
            isDarkMode
              ? "border-slate-800 bg-slate-900/40"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-400">
                Social Presence
              </p>
              <h2 className={`mt-2 text-xl font-bold sm:text-2xl ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                Follow the network across platforms
              </h2>
            </div>
            <p className={`max-w-xl text-sm leading-7 ${isDarkMode ? "text-slate-400" : "text-slate-600 font-semibold"}`}>
              Stay connected through the platforms where the community is most active.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.link}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition duration-200 ${
                  isDarkMode
                    ? "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                } ${social.tone}`}
              >
                <span>{social.icon}</span>
                <span>{social.name}</span>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Contact the Developers Section */}
        <motion.div variants={item} className="space-y-4 pt-4">
          <div className="text-center">
            <h2 className={`text-2xl font-bold tracking-tight sm:text-3xl ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Contact the Developers
            </h2>
            <p className={`mx-auto mt-2 max-w-2xl text-sm leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600 font-semibold"}`}>
              Found a bug, have a feature request, or want to contribute? Reach out to the team building IIITians Network.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto mt-6">
            {developers.map((dev) => (
              <ProfileCard
                key={dev.name}
                name={dev.name}
                role={dev.role}
                iiit={dev.iiit}
                linkedin={dev.linkedin}
                photoUrl={dev.photoUrl}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}

