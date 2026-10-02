"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export default function TournamentPopup() {
  const [mount, setMount] = useState(false);
  const [show, setShow] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const refreshStatus = async () => {
      try {
        const response = await fetch("/api/popup", { cache: "no-store" });
        const data = await response.json();
        if (!cancelled) {
          const active = response.ok && data.active === true;
          setIsActive(active);
          if (!active) {
            setShow(false);
            setMount(false);
          }
        }
      } catch {
        if (!cancelled) {
          setIsActive(false);
          setShow(false);
          setMount(false);
        }
      }
    };

    void refreshStatus();
    const interval = window.setInterval(refreshStatus, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!isActive) return;

    if (sessionStorage.getItem("hasSeenTournamentPopup")) return;

    let transitionTimer: number;
    const mountTimer = window.setTimeout(() => {
      setMount(true);
      transitionTimer = window.setTimeout(() => {
        setShow(true);
        sessionStorage.setItem("hasSeenTournamentPopup", "true");
      }, 50);
    }, 1500);
    return () => {
      window.clearTimeout(mountTimer);
      window.clearTimeout(transitionTimer);
    };
  }, [isActive]);

  const handleClose = () => {
    setShow(false);
    // Wait for fade out animation before unmounting
    setTimeout(() => setMount(false), 300);
  };

  if (!mount) return null;

  return (
    <div
      className={`fixed inset-0 z-9999 flex items-center justify-center p-4 transition-colors duration-300 ${
        show ? "bg-black/60 backdrop-blur-sm" : "bg-black/0 backdrop-blur-none"
      }`}
    >
      <div
        className={`relative w-full max-w-5xl overflow-hidden rounded-2xl  transition-all duration-300 `}
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-sm bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/80  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-transparent"
          aria-label="Close popup"
        >
          <X className="h-6 w-6" />
        </button>

        <a
          href="https://esports.iiitiansnetwork.in"
          target="_blank"
          rel="noopener noreferrer"
          className="block relative aspect-1942/809 w-full bg-slate-950 group"
          onClick={handleClose}
        >
          <Image
            src="/InstaBanner.png"
            alt="Inter-IIIT Esports Championship"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 5"
            priority
          />

          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 pointer-events-none">
            {/* <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl font-extrabold text-white mb-2 md:mb-4 drop-shadow-2xl transform transition-transform duration-500 group-hover:-translate-y-2">
             
        
              <span className="text-white"> Inter-IIIT Esports Championship</span>
            </h2> */}

            {/* <p className="text-white text-base md:text-xl font-medium drop-shadow-2xl  duration-500 group-hover:-translate-y-2">
              Registrations are now open.
            </p> */}
          </div>
        </a>
      </div>
    </div>
  );
}
