import type { Metadata } from "next";
import LegacyCertificateClient from "./LegacyCertificateClient";

export const metadata: Metadata = {
  title: "Legacy Certificate",
  description: "Access your IIITians Network Legacy certificate using your registered Legacy email.",
};

export default function LegacyCertificatePage() {
  return <LegacyCertificateClient />;
}
