import { ChevronRight } from "lucide-react";

interface GuideFlowSectionProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  steps?: { title: string; text: string }[];
  note?: string;
  variant?: string;
}

export default function GuideFlowSection({
  eyebrow,
  title,
  description,
  steps,
  note,
}: GuideFlowSectionProps) {
  return (
    <div className="rounded-[2.4rem] border border-white bg-white/40 p-5 shadow-[0_32px_80px_-40px_rgba(79,70,229,0.18)] backdrop-blur-xl sm:p-8">
      {eyebrow && (
        <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-indigo-700">
          {eyebrow}
        </p>
      )}
      {title && (
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h2>
      )}
      {description && (
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          {description}
        </p>
      )}

      {steps && steps.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => (
            <div
              key={step.title}
              className="group relative rounded-[1.6rem] border border-white bg-white/60 p-5 shadow-[0_10px_30px_-15px_rgba(79,70,229,0.1)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/90 hover:shadow-[0_20px_45px_-18px_rgba(79,70,229,0.18)]"
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-indigo-600">
                Step {String(idx + 1).padStart(2, "0")}
              </div>
              <div className="mt-3 flex items-start gap-2">
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-600">{step.text}</p>
            </div>
          ))}
        </div>
      )}

      {note && (
        <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 px-5 py-4">
          <p className="text-sm leading-6 text-indigo-700">
            <span className="font-bold">Note: </span>
            {note}
          </p>
        </div>
      )}
    </div>
  );
}
