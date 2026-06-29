"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import useThemeMode from "@/hooks/useThemeMode";

export default function DevelopersSection() {
  const { isDarkMode } = useThemeMode();
  const devs = [
    {
      name: "Varun Raj",
      college: "IIIT Ranchi",
      role: "Lead Software Developer",
      linkedin: "https://www.linkedin.com/in/varun-raj-85592b324?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      photoUrl: "https://res.cloudinary.com/iiitians-network/image/upload/v1776864098/colleges/dfyj49a97tb8naiolnts.jpg"
    },
    {
      name: "Ankur Singh",
      college: "IIIT Kota",
      role: "Vice President",
      linkedin: "https://www.linkedin.com/in/ankurrr27/",
      photoUrl: "https://res.cloudinary.com/iiitians-network/image/upload/v1775170056/colleges/gmhe0vo8mj9tvyg3halt.jpg"
    },
    {
      name: "Yash Kapoor",
      college: "IIIT Ranchi",
      role: "Development Team",
      linkedin: "https://www.linkedin.com/in/yash-kapoor-a17026251?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      photoUrl: "https://res.cloudinary.com/iiitians-network/image/upload/v1775327750/colleges/deyeldaslh5rbqhxddfq.jpg"
    }
  ];

  const [activeIndex, setActiveIndex] = useState(1); // Default to Ankur Singh in the middle
  const [isHovered, setIsHovered] = useState(false);

  // Auto rotation
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % devs.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isHovered, devs.length]);

  const getPosition = (index: number) => {
    const diff = (index - activeIndex + devs.length) % devs.length;
    if (diff === 0) return "center";
    if (diff === 1) return "right";
    return "left";
  };

  const cardWidth = 260;

  const cardVariants = {
    center: {
      x: 0,
      scale: 1.05,
      opacity: 1,
      zIndex: 10,
      rotate: 0,
      transition: { type: "spring", stiffness: 220, damping: 25 }
    },
    right: {
      x: 260,
      scale: 0.95,
      opacity: 1,
      zIndex: 5,
      rotate: 0,
      transition: { type: "spring", stiffness: 220, damping: 25 }
    },
    left: {
      x: -260,
      scale: 0.95,
      opacity: 1,
      zIndex: 5,
      rotate: 0,
      transition: { type: "spring", stiffness: 220, damping: 25 }
    }
  } as const;

  return (
    <section className={`py-12 border-t transition-colors duration-300 overflow-hidden ${
      isDarkMode ? "bg-slate-950/20 border-slate-900 text-slate-100" : "bg-white border-slate-100 text-slate-900"
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-left mb-8">
          <h2 className="mt-1.5 text-xl font-extrabold tracking-tight sm:text-2xl">
            Contact the Developers
          </h2>
        </div>

        {/* Mobile View: Stacked Container */}
        <div className="flex flex-col gap-4 px-4 pb-6 sm:hidden">
          {devs.map((dev) => (
            <div
              key={dev.name}
              className={`w-full flex items-center justify-between rounded-xl border p-4 shadow-sm transition-colors duration-300 ${
                isDarkMode ? "border-slate-800 bg-slate-900/60" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ${
                  isDarkMode ? "ring-slate-800" : "ring-slate-100"
                }`}>
                  <Image
                    src={dev.photoUrl}
                    alt={dev.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-extrabold truncate">
                    {dev.name}
                  </h4>
                  <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">
                    {dev.role}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-450 mt-0.5 truncate">
                    {dev.college}
                  </p>
                </div>
              </div>
              <a
                href={dev.linkedin}
                target="_blank"
                rel="noreferrer"
                title={`${dev.name}'s LinkedIn Profile`}
                className="text-[#0077b5] hover:text-[#005582] transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-100 rounded-full shrink-0 flex items-center justify-center min-h-[44px] min-w-[44px]"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          ))}
        </div>

        {/* Desktop View: Carousel Area */}
        <div 
          className="hidden sm:flex relative max-w-4xl mx-auto items-center justify-center h-[140px]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Cards container */}
          <div className="relative w-full h-full flex items-center justify-center">
            {devs.map((dev, index) => {
              const position = getPosition(index);
              const isActive = position === "center";
              return (
                <motion.div
                  key={dev.name}
                  animate={position}
                  variants={cardVariants}
                  onClick={() => {
                    if (!isActive) setActiveIndex(index);
                  }}
                  style={{
                    width: `${cardWidth}px`,
                    zIndex: isActive ? 10 : 5
                  }}
                  className={`absolute flex items-center justify-between rounded-xl border p-4 transition-colors duration-300 shrink-0 ${
                    isActive 
                      ? isDarkMode
                        ? "border-indigo-500/80 bg-gradient-to-br from-slate-900 to-indigo-950/20 shadow-[0_15px_40px_rgba(79,70,229,0.15)] cursor-default"
                        : "border-indigo-150 bg-gradient-to-br from-white via-white to-indigo-50/15 shadow-[0_15px_40px_rgba(79,70,229,0.05)] cursor-default" 
                      : isDarkMode
                        ? "border-slate-800/80 bg-slate-900/40 shadow-sm cursor-pointer hover:border-slate-700"
                        : "border-slate-200 bg-white shadow-sm cursor-pointer hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`relative h-13 w-13 shrink-0 overflow-hidden rounded-full transition-all duration-300 ring-2 ${
                      isActive 
                        ? isDarkMode ? "ring-indigo-900" : "ring-indigo-100" 
                        : isDarkMode ? "ring-slate-800" : "ring-slate-50"
                    }`}>
                      <Image
                        src={dev.photoUrl}
                        alt={dev.name}
                        fill
                        className="object-cover"
                        sizes="52px"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-extrabold truncate">
                        {dev.name}
                      </h4>
                      <p className="text-[11px] font-bold text-indigo-650 dark:text-indigo-400 mt-0.5 truncate">
                        {dev.role}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">
                        {dev.college}
                      </p>
                    </div>
                  </div>

                  <a
                    href={dev.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    title={`${dev.name}'s LinkedIn Profile`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[#0077b5] hover:text-[#005582] transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-100 rounded-full shrink-0 flex items-center justify-center min-h-[44px] min-w-[44px]"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
