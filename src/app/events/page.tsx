// SSR Server Component for /events
import type { Metadata } from "next";
import connectDB from "@/lib/mongoose";

export const dynamic = 'force-dynamic';

import Event from "@/models/Event";
import type { IEvent } from "@/types";
import EventsClient from "./EventsClient";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming and past events across IIIT campuses — hackathons, tech talks, cultural fests, and more.",
};

export const revalidate = 30;

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export default async function EventsPage() {
  await connectDB();
  const events = await Event.find().sort({ date: -1 }).lean();
  return <EventsClient initialEvents={serialize(events) as unknown as IEvent[]} />;

}
