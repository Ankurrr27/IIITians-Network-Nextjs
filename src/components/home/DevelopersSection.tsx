"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Linkedin } from "lucide-react";
import { motion } from "framer-motion";

export default function DevelopersSection() {
  const devs = [
    {
      name: "Varun Raj",
      college: "IIIT Ranchi",
      linkedin: "https://www.linkedin.com/in/varun-raj-85592b324?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      photoUrl: "https://res.cloudinary.com/iiitians-network/image/upload/v1776864098/colleges/dfyj49a97tb8naiolnts.jpg"
    },
    {
      name: "Ankur Singh",
      college: "IIIT Kota",
      linkedin: "https://www.linkedin.com/in/ankurrr27/",
      photoUrl: "https://res.cloudinary.com/iiitians-network/image/upload/v1775170056/colleges/gmhe0vo8mj9tvyg3halt.jpg"
    },
    {
      name: "Yash Kapoor",
      college: "IIIT Ranchi",
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

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const cardWidth = isMobile ? 220 : 260;

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
      x: isMobile ? 110 : 260,
      scale: 0.95,
      opacity: 1,
      zIndex: 5,
      rotate: 0,
      transition: { type: "spring", stiffness: 220, damping: 25 }
    },
    left: {
      x: isMobile ? -110 : -260,
      scale: 0.95,
      opacity: 1,
      zIndex: 5,
      rotate: 0,
      transition: { type: "spring", stiffness: 220, damping: 25 }
    }
  } as const;

  return (
    <section className="bg-white py-8 sm:py-10 border-t border-slate-100 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-indigo-600">
            Contributors
          </p>
          <h2 className="mt-1.5 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            Contact the Developers
          </h2>
          <p className="mx-auto mt-1 max-w-2xl text-[10px] leading-relaxed text-slate-400 font-bold uppercase tracking-wider">
            Autonomous & student-driven team behind the platform
          </p>
        </div>

        {/* Carousel Area */}
        <div 
          className="relative max-w-4xl mx-auto flex items-center justify-center h-[110px] sm:h-[130px]"
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
                    width: `${cardWidth}px`
                  }}
                  className={`absolute flex items-center justify-between rounded-xl border p-3 sm:p-4 transition-colors duration-300 shrink-0 ${
                    isActive 
                      ? "border-indigo-150 bg-gradient-to-br from-white via-white to-indigo-50/15 shadow-[0_15px_40px_rgba(79,70,229,0.05)] cursor-default" 
                      : "border-slate-200 bg-white shadow-sm cursor-pointer hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar: h-11 w-11 sm:h-13 sm:w-13 */}
                    <div className={`relative h-11 w-11 sm:h-13 sm:w-13 shrink-0 overflow-hidden rounded-full transition-all duration-300 ring-2 ${
                      isActive ? "ring-indigo-100" : "ring-slate-50"
                    }`}>
                      <Image
                        src={dev.photoUrl}
                        alt={dev.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 44px, 52px"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-955 truncate">
                        {dev.name}
                      </h4>
                      <p className="text-[10px] sm:text-xs font-semibold text-slate-400 mt-0.5 truncate">
                        {dev.college}
                      </p>
                    </div>
                  </div>

                  {/* LinkedIn icon in brand color */}
                  <a
                    href={dev.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    title={`${dev.name}'s LinkedIn Profile`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[#0077b5] hover:text-[#005582] transition-colors p-1.5 hover:bg-slate-50 rounded-full shrink-0"
                  >
                    <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
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
