"use client";

import React from "react";

interface BlobWithLogoProps {
  logoSrc?: string;
}

export default function BlobWithLogo({ logoSrc = "/iiitians-logo.png" }: BlobWithLogoProps) {
  return (
    <div
      className="
        relative flex items-center justify-center
        w-[300px] h-[280px]
        sm:w-[340px] sm:h-[340px]
        md:w-[420px] md:h-[420px]
        lg:w-[480px] lg:h-[480px]
      "
    >
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full z-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="blobGradientHeroUnique"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="100%" stopColor="#c7d2fe" />
          </linearGradient>
        </defs>

        <path
          d="M52.8,-56.7C67.3,-44.5,78.9,-22.3,75.5,-3.6C72.1,15.2,53.8,30.3,39.2,44.6C24.6,59,12.3,72.7,-3.2,76.4C-18.7,80.1,-37.3,73.8,-49.4,61.4C-61.5,49,-67.2,30.6,-69.3,12.2C-71.3,-6.3,-69.7,-24.6,-60.2,-39.2C-50.7,-53.9,-33.3,-64.9,-14.2,-70.7C5,-76.5,24.9,-77.8,42.2,-69.2C59.5,-60.5,74.4,-42.9,83.2,-24.8C92,-6.6,94.6,12.7,87.4,28.7C80.3,44.8,63.4,57.7,47.4,66.3C31.4,75,16.2,79.3,2.6,80C-10.9,80.8,-21.8,78.2,-32.4,72.6C-43,67.1,-53.4,58.7,-64.5,49.1C-75.7,39.5,-87.5,28.7,-92.6,15.4C-97.7,2.2,-95.9,-14.5,-84.8,-29.7C-73.8,-44.9,-53.4,-58.5,-35.1,-66.6C-16.9,-74.7,-0.7,-77.1,12.5,-70.2C25.8,-63.4,36.1,-47.5,52.8,-56.7Z"
          transform="translate(100 100)"
          fill="url(#blobGradientHeroUnique)"
          opacity="0.9"
        />
      </svg>

      <img
        src={logoSrc}
        alt="Logo"
        className="
          relative z-10
          w-[280px]
          sm:w-[260px]
          md:w-[320px]
          lg:w-[360px]
          drop-shadow-xl
        "
      />
    </div>
  );
}
