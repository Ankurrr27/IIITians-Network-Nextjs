"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Instagram, Linkedin, Globe2, Eye } from "lucide-react";
import api from "@/lib/apiClient";

function AnimatedCounter({ value, duration = 2000, trigger = false }: { value: number; duration?: number; trigger?: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;

    const end = value;
    const totalMilliseconds = duration;
    const startTime = performance.now();

    const updateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalMilliseconds, 1);
      const easedProgress = progress * (2 - progress); // easeOutQuad
      const currentCount = Math.floor(easedProgress * end);

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(updateCount);
  }, [value, duration, trigger]);

  return <span>{count.toLocaleString()}</span>;
}

export default function NetworkReachSection() {
  const [stats, setStats] = useState({
    instagramFollowers: 12400,
    linkedinFollowers: 18500,
    overallReach: 750000,
    totalViews: 45000,
  });
  const [loading, setLoading] = useState(true);

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    api.get("/site-stats")
      .then((res) => {
        if (res.data) {
          setStats({
            instagramFollowers: res.data.instagramFollowers ?? 12400,
            linkedinFollowers: res.data.linkedinFollowers ?? 18500,
            overallReach: res.data.overallReach ?? 750000,
            totalViews: res.data.totalViews ?? 0,
          });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch site stats:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const statCards = [
    {
      label: "Instagram Followers",
      value: stats.instagramFollowers,
      suffix: "",
      icon: Instagram,
      iconBg: "bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-500 text-white",
      hoverGlow: "group-hover:bg-purple-500/5",
      description: "Direct community outreach",
    },
    {
      label: "LinkedIn Followers",
      value: stats.linkedinFollowers,
      suffix: "",
      icon: Linkedin,
      iconBg: "bg-blue-600 text-white",
      hoverGlow: "group-hover:bg-blue-600/5",
      description: "Professional & alumni connections",
    },
    {
      label: "Overall Reach",
      value: stats.overallReach,
      suffix: "+",
      icon: Globe2,
      iconBg: "bg-indigo-600 text-white",
      hoverGlow: "group-hover:bg-indigo-600/5",
      description: "Impacting aspirants & students",
    },
    {
      label: "Website Views",
      value: stats.totalViews,
      suffix: "",
      icon: Eye,
      iconBg: "bg-emerald-600 text-white",
      hoverGlow: "group-hover:bg-emerald-600/5",
      description: "Total platform interactions",
    },
  ];

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-slate-950 py-12 sm:py-24 border-t border-slate-900">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* Heading container */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-2xl font-extrabold tracking-tight !text-white sm:text-4xl leading-tight"
          >
            Network Reach
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm sm:text-base !text-slate-400 font-medium leading-relaxed"
          >
            Our growing nationwide student and professional network connecting IIIT campuses, students, alumni, and aspirants.
          </motion.p>
        </div>

        {/* Stats Grid - 2x2 on Mobile, 1x4 on Desktop */}
        <div className="grid grid-cols-2 gap-3.5 mt-8 sm:mt-16 lg:grid-cols-4 lg:gap-6">
          {statCards.map((card, i) => {
            const IconComp = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-6 backdrop-blur transition-all duration-300 hover:border-slate-700/80 hover:-translate-y-1"
              >
                {/* Hover glow layer */}
                <div className={`absolute inset-0 transition-colors duration-300 ${card.hoverGlow}`} />

                {/* Icon wrapper */}
                <div className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl ${card.iconBg}`}>
                  <IconComp className="h-4.5 w-4.5 sm:h-5.5 sm:w-5.5" />
                </div>

                {/* Stat value */}
                <div className="mt-3 sm:mt-5 text-xl sm:text-4xl font-black !text-white tracking-tight flex items-baseline gap-0.5">
                  <AnimatedCounter value={card.value} trigger={isInView} />
                  {card.suffix && <span className="!text-indigo-400 font-extrabold text-xs sm:text-lg">{card.suffix}</span>}
                </div>

                {/* Label */}
                <h3 className="mt-1 sm:mt-2 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider !text-slate-400 leading-normal">
                  {card.label}
                </h3>

                {/* Description */}
                <p className="mt-1 sm:mt-1.5 text-[10px] sm:text-xs !text-slate-500 font-medium leading-normal">
                  {card.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
