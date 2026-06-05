"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import {
  BookOpenText,
  Building2,
  Handshake,
  FileText,
  Megaphone,
  Sparkles,
  Users,
  UserPlus,
  ArrowLeft,
  Images,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import GuideFlowSection from "./components/GuideFlowSection";

interface FlowTab {
  id: string;
  label: string;
  icon: typeof Building2;
  eyebrow: string;
  title: string;
  description: string;
  steps: { title: string; text: string }[];
  note: string;
  type: "public" | "admin" | "both";
}

const flowTabs: FlowTab[] = [
  {
    id: "discuss",
    label: "Club Account",
    icon: Building2,
    eyebrow: "Guide",
    title: "How clubs create an account and start posting",
    description:
      "A club first creates its Discuss account, logs in with its handle, and then uses the same account to publish updates later.",
    steps: [
      {
        title: "Open Discuss",
        text: "Go to the Discuss page from the navbar, or use the three-dot menu on any college card to start club registration with that college already filled in.",
      },
      {
        title: "Register the club",
        text: "Use the labeled fields to enter college name, club name, point-of-contact details, club website or primary page, a handle, and a password. College selection now supports suggestion dropdowns too.",
      },
      {
        title: "Wait for admin approval",
        text: "Registration creates a pending club request first. An admin reviews and verifies the request before the account can log in and post.",
      },
      {
        title: "Log in later with the same handle",
        text: "After approval, use the handle with the fixed @iiitiansnetwork identity and your password to restore the same account.",
      },
    ],
    note: "Every new club signup from Discuss or a college card is first raised as an admin review request.",
    type: "public",
  },
  {
    id: "event",
    label: "Announcements & Events",
    icon: Megaphone,
    eyebrow: "Guide",
    title: "How to post an announcement or push something as an event",
    description:
      "Discuss works for normal announcements, collaborations, campaigns, and events. When a club pushes a post as an event, it automatically appears on the Events page and is sorted by event date for the main page Highlights.",
    steps: [
      {
        title: "Open Post update",
        text: "After logging in, use the Post update button or the plus button on mobile.",
      },
      {
        title: "Choose the right post type",
        text: "Pick announcement for regular updates, or choose event when you want it represented as an actual event post.",
      },
      {
        title: "Add images, date, and link",
        text: "Upload event poster images, add the event date, and provide the registration or event link.",
      },
      {
        title: "Wait for approval",
        text: "Approved event posts appear on the Events page and are displayed as Latest Highlights on the home page based on their occurrence date.",
      },
    ],
    note: "Use the Manage account sidebar to edit or delete any past post later.",
    type: "public",
  },
  {
    id: "legacy",
    label: "Network Legacy",
    icon: Users,
    eyebrow: "Guide",
    title: "How to join the Network Legacy section",
    description:
      "Legacy is the public record of people who have been part of the network. Submissions are reviewed first, then shown on the public legacy page after approval.",
    steps: [
      {
        title: "Open the Legacy page",
        text: "Go to Network Legacy and open the submission form.",
      },
      {
        title: "Fill role and profile details",
        text: "Use the labeled fields to add batch or team term, network post, current role, company, location, and profile links. Most fields now include example data so the format is easier to follow.",
      },
      {
        title: "Reuse team photo if available",
        text: "If you already exist on the team page, the form can reuse your team photo instead of requiring a new one.",
      },
      {
        title: "Submit for admin review",
        text: "After approval, your legacy card becomes visible in the public Network Legacy section.",
      },
    ],
    note: "Team members can also flow into legacy with their latest network role and journey history.",
    type: "public",
  },
  {
    id: "member",
    label: "Become a Member",
    icon: UserPlus,
    eyebrow: "Guide",
    title: "How to become a visible member of the network",
    description:
      "People usually become visible in the network through teams, legacy, events, or club participation. This flow explains the clean path for joining and staying discoverable on the site.",
    steps: [
      {
        title: "Start with the right entry point",
        text: "If you are active in a club, begin through Discuss. If you served in the network, use Legacy. If you join the team officially, admins add you in Team. College fields now prefer dropdown-style matching to keep records consistent.",
      },
      {
        title: "Keep your public profile complete",
        text: "Add your role, institute, current work, and links so people can actually identify and connect with you later.",
      },
      {
        title: "Let admins map your journey",
        text: "Once approved, your latest role can appear publicly while your previous posts can still be preserved in legacy history.",
      },
    ],
    note: "The best network profiles are consistent across Team, Legacy, Colleges, and Discuss.",
    type: "public",
  },
  {
    id: "collab",
    label: "Collaboration",
    icon: Handshake,
    eyebrow: "Guide",
    title: "How to collaborate with another club, campus, or network initiative",
    description:
      "Use Discuss when you want to raise a campaign, ask for collaboration, promote a shared event, or invite another IIIT community into something bigger. The form now uses clearer labels and example values so clubs know exactly what each field means.",
    steps: [
      {
        title: "Create the right post",
        text: "Use Discuss to write a clean collaboration request with context, dates, link, and who the collaboration is for.",
      },
      {
        title: "Mention the value clearly",
        text: "Say whether it is an event partnership, media support, club-to-club campaign, or campus-wide participation ask.",
      },
      {
        title: "Keep contact simple",
        text: "Use the club identity, not personal clutter, so interested communities know which club to approach back.",
      },
    ],
    note: "Collaboration posts work best when they are short, visual, and clear about the expected outcome.",
    type: "public",
  },
  {
    id: "gallery",
    label: "Gallery Hub",
    icon: Images,
    eyebrow: "Guide",
    title: "Contribute your college photos",
    description:
      "Every student can contribute photos of their campus, clubs, and fests to help build their institute's public identity.",
    steps: [
      {
        title: "Open the College Card",
        text: "Find your college on the main directory and click on 'View Gallery'.",
      },
      {
        title: "Upload contribution",
        text: "Enter a caption that describes the photo (e.g., 'Annual Fest Night') and upload a clear visual.",
      },
      {
        title: "Wait for validation",
        text: "Your contributions help others see your campus life. Admins review images to ensure the profile stays premium.",
      },
      {
        title: "Official Visibility",
        text: "Highly rated or clear photos are featured in the college's main display slider.",
      },
    ],
    note: "Contribution is open to everyone, but quality visuals help your college stand out.",
    type: "public",
  },
];

export default function GuidePage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    }>
      <GuidePageClient />
    </Suspense>
  );
}

function GuidePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFlow = searchParams.get("flow");

  const filteredFlows = useMemo(() => {
    return flowTabs.filter((item) => item.type === "public" || item.type === "both");
  }, []);

  const [activeFlow, setActiveFlow] = useState(
    filteredFlows.some((item) => item.id === initialFlow)
      ? initialFlow!
      : filteredFlows[0].id
  );

  useEffect(() => {
    const flow = searchParams.get("flow");
    if (
      flow &&
      filteredFlows.some((item) => item.id === flow) &&
      flow !== activeFlow
    ) {
      setActiveFlow(flow);
    }
  }, [activeFlow, searchParams, filteredFlows]);

  const currentFlow = useMemo(() => {
    return filteredFlows.find((item) => item.id === activeFlow) || filteredFlows[0];
  }, [activeFlow, filteredFlows]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#eef4ff_0%,_#f7fbff_34%,_#ffffff_100%)]">
      <section className="relative overflow-hidden px-4 pb-8 pt-20 sm:px-6 sm:pb-12 sm:pt-24">
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_56%)]" />
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="group flex h-9 w-9 items-center justify-center rounded-full border border-indigo-100 bg-white/80 text-indigo-600 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md active:scale-95"
            >
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
            </button>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/85 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-700">
              <Sparkles className="h-4 w-4" />
              Website Guide
            </div>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <h1 className="max-w-4xl text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Learn how to use every major part of IIITians Network.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600 sm:text-lg">
                This guide shows how clubs post updates, how events move into the Events page, and how students join the network history.
              </p>
            </div>

            <div className="relative rounded-[2.4rem] border border-white bg-white/40 p-5 shadow-[0_32px_80px_-40px_rgba(79,70,229,0.25)] backdrop-blur-xl sm:p-7">
              <div className="grid gap-3 sm:grid-cols-3">
                <GuideStat
                  icon={BookOpenText}
                  title={`${filteredFlows.length} guided flows`}
                  text="Clubs, events, legacy, membership, and collabs."
                />
                <GuideStat
                  icon={Megaphone}
                  title="Event-ready"
                  text="Push as event with date and link."
                />
                <GuideStat
                  icon={FileText}
                  title="Admin-reviewed"
                  text="Public data appears after approval."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap gap-3">
            {filteredFlows.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeFlow;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveFlow(item.id);
                    const url = new URL(window.location.href);
                    url.searchParams.set("flow", item.id);
                    window.history.replaceState({}, "", url.toString());
                  }}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-[0_14px_30px_-16px_rgba(79,70,229,0.8)]"
                      : "border border-indigo-100 bg-white text-slate-700 hover:bg-indigo-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <GuideFlowSection
              eyebrow={currentFlow.eyebrow}
              title={currentFlow.title}
              description={currentFlow.description}
              steps={currentFlow.steps}
              note={currentFlow.note}
              variant={currentFlow.id}
            />
          </div>

          <div className="mt-8 rounded-[2.4rem] border border-white bg-white/40 p-5 shadow-[0_32px_80px_-40px_rgba(79,70,229,0.18)] backdrop-blur-xl sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Quick use path
              </h2>
              <p className="mt-2 text-slate-600">Common actions and solutions for every user.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3 xl:grid-cols-4">
              <MiniPath
                step="01"
                title="Need to announce something?"
                text="Open Discuss, log into the club account, and post an announcement."
              />
              <MiniPath
                step="02"
                title="Need to promote an event?"
                text="Choose event while posting, attach date and link, then let approval push it live."
              />
              <MiniPath
                step="03"
                title="Need to join legacy?"
                text="Open Network Legacy, submit details, and wait for approval before public listing."
              />
              <MiniPath
                step="04"
                title="Want to become a network member?"
                text="Use the member guide to see the clean path from activity to public presence."
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function GuideStat({ icon: Icon, title, text }: { icon: typeof BookOpenText; title: string; text: string }) {
  return (
    <div className="group rounded-[1.8rem] border border-white/40 bg-white/50 p-4 transition-all duration-300 hover:bg-white/80 md:p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm transition-transform group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-sm font-bold text-slate-900">{title}</div>
      <div className="mt-1 text-sm leading-6 text-slate-600">{text}</div>
    </div>
  );
}

function MiniPath({ step, title, text }: { step: string; title: string; text: string }) {
  return (
    <div className="group relative rounded-[1.8rem] border border-white bg-white/60 p-5 shadow-[0_10px_30px_-15px_rgba(79,70,229,0.1)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/90 hover:shadow-[0_22px_45px_-20px_rgba(79,70,229,0.2)] sm:p-7">
      <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-indigo-700 transition-transform group-hover:scale-105 group-hover:text-indigo-600">
        Step {step}
      </div>
      <div className="mt-3 text-lg font-bold text-slate-900 leading-tight">{title}</div>
      <p className="mt-3 text-sm leading-7 text-slate-600 group-hover:text-slate-700">{text}</p>
    </div>
  );
}
