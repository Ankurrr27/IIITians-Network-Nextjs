"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { summarizeAllYears, buildPlacementFaqs } from "@/lib/placementInsights";

interface PlacementFaqsProps {
  data: any;
  yearData: any;
}

export default function PlacementFaqs({ data, yearData }: PlacementFaqsProps) {
  const [openIndex, setOpenIndex] = useState<number>(0);
  
  const faqs = useMemo(() => {
    const summaries = summarizeAllYears(data?.yearlyPlacements || []);
    return buildPlacementFaqs({ data, yearData, summaries });
  }, [data, yearData]);

  if (!faqs.length) return null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] sm:p-8">
      <div className="mb-6 space-y-2 border-b border-slate-100 pb-4">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Common Queries</span>
        <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">Placement queries & answers</h3>
        <p className="text-xs font-semibold leading-relaxed text-slate-500">
          Dynamic metrics context answers mapped to this campus output
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div 
              key={faq.question} 
              className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                isOpen 
                  ? "border-indigo-200 bg-indigo-50/10 shadow-sm" 
                  : "border-slate-200/80 bg-white hover:bg-slate-50/30 hover:border-slate-300"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4.5 text-left transition"
              >
                <span className="text-sm font-bold text-slate-900 sm:text-base">{faq.question}</span>
                <ChevronDown className={`h-4.5 w-4.5 shrink-0 text-indigo-600 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-slate-100 px-5 py-4 text-xs sm:text-sm font-semibold leading-relaxed text-slate-500">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
