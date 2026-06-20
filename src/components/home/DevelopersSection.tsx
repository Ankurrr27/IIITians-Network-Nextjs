"use client";

import React from "react";
import Image from "next/image";
import { Linkedin } from "lucide-react";

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

  return (
    <section className="bg-white py-16 sm:py-20 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">
            Contributors
          </p>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Contact the Developers
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-slate-500 font-semibold uppercase tracking-wide">
            Autonomous & student-driven team behind the platform
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 max-w-3xl mx-auto">
          {devs.map((dev) => (
            <div
              key={dev.name}
              className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow hover:border-slate-300 duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-indigo-50 group-hover:ring-indigo-100 transition-all duration-300">
                  <Image
                    src={dev.photoUrl}
                    alt={dev.name}
                    fill
                    className="object-cover"
                    sizes="44px"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-950 truncate">{dev.name}</h4>
                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{dev.college}</p>
                </div>
              </div>

              <a
                href={dev.linkedin}
                target="_blank"
                rel="noreferrer"
                title={`LinkedIn Profile`}
                className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-slate-500/5 transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
