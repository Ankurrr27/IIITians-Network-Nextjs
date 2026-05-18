"use client";

import { motion } from "framer-motion";
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
  show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" as any } },
};

export default function ContactPage() {
  const socialLinks = [
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
      icon: <Mail size={22} className="text-indigo-600" />,
      cta: "Mail us",
    },
    {
      title: "Instagram",
      subtitle: "Community updates, highlights, and latest activity",
      href: "https://www.instagram.com/iiitiansnetwork",
      icon: <Instagram size={22} className="text-pink-600" />,
      cta: "View profile",
    },
    {
      title: "Transparency",
      subtitle: "Public information bridge with clear and verified outreach",
      icon: <ShieldCheck size={22} className="text-emerald-600" />,
      static: true,
    },
  ];

  return (
    <div className="relative min-h-screen bg-[linear-gradient(180deg,_#eff6ff_0%,_#f8faff_40%,_#ffffff_100%)] pb-14 pt-24 text-slate-900 sm:pb-20 sm:pt-28">
      {/* Radial Gradient Overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_0_22%),radial-gradient(circle_at_80%_18%,rgba(125,211,252,0.18),transparent_0_20%),radial-gradient(circle_at_72%_72%,rgba(96,165,250,0.12),transparent_0_24%)]" />

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6"
      >
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-700 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Official Channels
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Contact The <span className="text-indigo-600 font-semibold">IIITians Network</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base font-semibold">
                Reach the network through verified public channels for updates,
                collaboration, and community coordination across IIIT campuses.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.35rem] border border-slate-200 bg-white/70 backdrop-blur-md px-4 py-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Best For
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  Official outreach, student queries, and updates
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-slate-200 bg-white/70 backdrop-blur-md px-4 py-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Response Path
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  Email first, social platforms for visibility
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto mt-8 max-w-7xl px-4 sm:px-6"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {contactCards.map((card) =>
            card.static ? (
              <motion.div
                key={card.title}
                variants={item}
                className="rounded-[1.6rem] border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm sm:p-6"
              >
                {card.icon}
                <h2 className="mt-4 text-xl font-bold text-slate-900">
                  {card.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600 font-semibold">
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
                className="group rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_20px_50px_rgba(79,70,229,0.08)] sm:p-6"
              >
                {card.icon}
                <h2 className="mt-4 text-xl font-bold text-slate-900">
                  {card.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600 font-semibold">
                  {card.subtitle}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-indigo-600">
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

        <motion.div
          variants={item}
          className="mt-6 rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">
                Social Presence
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Follow the network across platforms
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600 font-semibold">
              Stay connected through the platforms where the community is most active.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.link}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-700 transition ${social.tone}`}
              >
                <span>{social.icon}</span>
                <span>{social.name}</span>
              </a>
            ))}
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}
