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
    <section className="sm:rounded-3xl sm:border sm:border-slate-200 sm:bg-white sm:p-8 sm:shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
      <div className="mb-4 space-y-1 border-b border-slate-100 pb-3 sm:mb-6 sm:space-y-2 sm:pb-4">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Common Queries</span>
        <h3 className="text-base font-bold text-slate-900 sm:text-2xl">Placement Q&amp;A</h3>
        <p className="text-xs font-semibold leading-relaxed text-slate-500 sm:block hidden">
          Dynamic metrics context answers mapped to this campus output
        </p>
      </div>

      <div className="divide-y divide-slate-100 sm:divide-y-0 sm:space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div 
              key={faq.question} 
              className={`sm:overflow-hidden sm:rounded-2xl sm:border sm:transition-all sm:duration-300 ${
                isOpen 
                  ? "sm:border-indigo-200 sm:bg-indigo-50/10 sm:shadow-sm" 
                  : "sm:border-slate-200/80 sm:bg-white sm:hover:bg-slate-50/30 sm:hover:border-slate-300"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-3 py-3.5 px-0 sm:px-5 sm:py-4 text-left transition"
              >
                <span className="text-sm font-semibold text-slate-800">{faq.question}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-indigo-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-3.5 px-0 sm:border-t sm:border-slate-100 sm:px-5 sm:py-4 text-xs font-medium leading-relaxed text-slate-500">
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
