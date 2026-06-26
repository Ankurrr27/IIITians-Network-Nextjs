"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Instagram, Linkedin, Globe2, Eye } from "lucide-react";
import api from "@/lib/apiClient";

function AnimatedCounter({ value, duration = 2000, trigger = false }: { value: number; duration?: number; trigger?: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    const startTime = performance.now();
    const update = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = progress * (2 - progress);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(update);
      else setCount(value);
    };
    requestAnimationFrame(update);
  }, [value, duration, trigger]);

  return <span>{count.toLocaleString()}</span>;
}

export default function NetworkReachSection() {
  const [stats, setStats] = useState({
    instagramFollowers: 0,
    linkedinFollowers: 0,
    overallReach: 0,
    totalViews: 0,
  });
  const [loaded, setLoaded] = useState(false);

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    api.get("/site-stats")
      .then((res) => {
        if (res.data) {
          setStats({
            instagramFollowers: res.data.instagramFollowers ?? 0,
            linkedinFollowers: res.data.linkedinFollowers ?? 0,
            overallReach: res.data.overallReach ?? 0,
            totalViews: res.data.totalViews ?? 0,
          });
          setLoaded(true);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch site stats:", err);
        setLoaded(false);
      });
  }, []);

  const statCards = [
    {
      label: "Instagram Followers",
      value: stats.instagramFollowers,
      suffix: "",
      icon: Instagram,
      iconColor: "text-pink-400",
      description: "Direct community outreach",
    },
    {
      label: "LinkedIn Followers",
      value: stats.linkedinFollowers,
      suffix: "",
      icon: Linkedin,
      iconColor: "text-blue-400",
      description: "Professional & alumni connections",
    },
    {
      label: "Overall Reach",
      value: stats.overallReach,
      suffix: "+",
      icon: Globe2,
      iconColor: "text-indigo-400",
      description: "Impacting aspirants & students",
    },
    {
      label: "Website Views",
      value: stats.totalViews,
      suffix: "",
      icon: Eye,
      iconColor: "text-emerald-400",
      description: "Total platform interactions",
    },
  ];

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-slate-950 py-12 sm:py-16 border-t border-slate-900">
      {/* Subtle glow */}
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45 }}
            className="text-2xl font-bold tracking-tight !text-white sm:text-4xl"
          >
            Network Reach
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="mt-3 text-sm !text-slate-500 leading-relaxed sm:text-base"
          >
            Our growing nationwide student and professional network connecting IIIT campuses, students, alumni, and aspirants.
          </motion.p>
        </div>

        {/* Stats Grid — 2×2 mobile, 4-col desktop */}
        <div className="grid grid-cols-2 gap-px bg-slate-800/50 rounded-2xl overflow-hidden sm:gap-0 sm:bg-transparent sm:rounded-none lg:grid-cols-4">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.12 + i * 0.08 }}
                className="flex flex-col gap-2.5 bg-slate-950 p-5 sm:p-0 sm:bg-transparent sm:border-l sm:border-slate-800/70 sm:pl-8 first:sm:border-l-0 first:sm:pl-0"
              >
                <Icon className={`h-4.5 w-4.5 sm:h-5 sm:w-5 ${card.iconColor} shrink-0`} />

                <div className="text-2xl font-bold !text-white sm:text-4xl tracking-tight leading-none flex items-baseline gap-0.5">
                  <AnimatedCounter value={card.value} trigger={isInView} />
                  {card.suffix && (
                    <span className={`text-sm sm:text-xl font-bold ${card.iconColor}`}>{card.suffix}</span>
                  )}
                </div>

                <div>
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest !text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-0.5 text-[10px] sm:text-xs !text-slate-600 font-medium leading-snug">
                    {card.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
