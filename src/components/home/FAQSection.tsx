"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle } from "lucide-react";
import useThemeMode from "@/hooks/useThemeMode";

export default function FAQSection() {
  const { isDarkMode } = useThemeMode();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is IIITians Network?",
      answer: "IIITians Network is an autonomous, student-led community and platform connecting all 31 Indian Institutes of Information Technology (IIITs) across India. It serves as a unified talent layer, digital directory, and collaboration network for students, alumni, recruiters, and aspirants."
    },
    {
      question: "How can I verify my profile on the platform?",
      answer: "Profile verification is secure. To apply for jobs or internships, or to post announcements, you verify your official IIIT student or alumni email address (e.g. yourname@iiitranchi.ac.in) via a secure OTP verification flow."
    },
    {
      question: "How can recruiters hire from IIITs through this platform?",
      answer: "Recruiters can use our verified Talent Marketplace to post job and internship listings. By submitting an opportunity, you reach students across all IIIT campuses simultaneously, bypassing the need to contact each placement cell separately. Work emails are required to maintain high quality."
    },
    {
      question: "Are placement statistics and alumni details verified?",
      answer: "Yes, transparency and trust are our highest priorities. All student applications, alumni achievements, and placement datasets are verified by our team of coordinators and official campus email verification before they are published."
    },
    {
      question: "Can student clubs and campus events be promoted here?",
      answer: "Absolutely. Verified student clubs can post announcement updates, register hackathons, showcase cultural or technical fests, and find collaborators across other IIIT campuses via the centralized Events and Discuss sections."
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className={`py-10 sm:py-16 border-t transition-colors duration-300 ${
      isDarkMode ? "bg-slate-955/20 border-slate-900 text-slate-100" : "bg-slate-50/30 border-slate-100 text-slate-900"
    }`}>
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-left mb-6 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight sm:text-3xl">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-0 sm:space-y-4 -mx-4 sm:mx-0">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`sm:rounded-2xl border-b sm:border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? isDarkMode ? "bg-indigo-950/20 border-indigo-500/50" : "bg-indigo-50/30 sm:border-indigo-600 shadow-sm"
                    : isDarkMode ? "bg-slate-900/10 border-slate-800/80 hover:border-slate-800" : "bg-white border-slate-200 hover:border-slate-300"
                } ${index === 0 ? "border-t sm:border-t-slate-200 sm:border-t" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className={`flex w-full items-center justify-between px-4 py-4 sm:p-5 text-left font-bold text-sm sm:text-base cursor-pointer focus:outline-none ${
                    isOpen ? (isDarkMode ? "text-indigo-400" : "text-indigo-700") : ""
                  }`}
                >
                  <span className="pr-4">{faq.question}</span>
                  {isOpen ? (
                    <Minus className={`h-4 w-4 shrink-0 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
                  ) : (
                    <Plus className={`h-4 w-4 shrink-0 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`} />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className={`px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm font-medium leading-relaxed border-t pt-3 sm:pt-4 ${
                        isDarkMode ? "text-slate-400 border-indigo-900/40" : "text-slate-600 border-indigo-100"
                      }`}>
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
