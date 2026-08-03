"use client";

import { ReactLenis } from "lenis/react";

export default function SmoothScrolling({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactLenis root options={{ lerp: 0.12, duration: 1.1, smoothWheel: true, touchMultiplier: 2 }}>
      {children}
    </ReactLenis>
  );
}
