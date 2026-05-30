"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import api from "@/lib/apiClient";
import { APP_NOTIFICATION_EVENT } from "@/utils/appNotifications";

const POLL_INTERVAL_MS = 90000;
const VIEW_MILESTONE_STORAGE_KEY = "iiitians-network-last-view-milestone";
const ENTRY_NOTIFICATION_STORAGE_KEY = "iiitians-network-last-entry-notification";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message?: string;
}

interface Snapshot {
  posts: number;
  events: number;
  legacy: number;
  team: number;
  clubs: number;
  views: number;
}

export default function InAppNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const snapshotRef = useRef<Snapshot>({ posts: 0, events: 0, legacy: 0, team: 0, clubs: 0, views: 0 });
  const initializedRef = useRef(false);

  useEffect(() => {
    const pushNotification = (notification: Omit<NotificationItem, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setItems((prev) => [{ id, ...notification }, ...prev].slice(0, 3));
      window.setTimeout(() => { setItems((prev) => prev.filter((item) => item.id !== id)); }, 4000);
    };

    const handleAppNotification = (event: Event) => {
      const e = event as CustomEvent;
      if (!e?.detail?.title) return;
      
      // If it's success/error, we might want to remove loading notifications to prevent stacking too many
      if (e.detail.type === "success" || e.detail.type === "error") {
        setItems((prev) => prev.filter(item => item.type !== "loading"));
      }

      pushNotification(e.detail);
    };
    window.addEventListener(APP_NOTIFICATION_EVENT, handleAppNotification);

    return () => {
      window.removeEventListener(APP_NOTIFICATION_EVENT, handleAppNotification);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[70] flex w-full max-w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 flex-col gap-2.5 sm:bottom-auto sm:top-24 sm:right-6 sm:left-auto sm:translate-x-0">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <NotificationCard
            key={item.id}
            item={item}
            onClose={() => setItems((prev) => prev.filter((e) => e.id !== item.id))}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

const NotificationCard = React.forwardRef<HTMLDivElement, { item: NotificationItem; onClose: () => void }>(
  ({ item, onClose }, ref) => {
    const isSuccess = item.type === "success";
    const isError = item.type === "error";
    const isLoading = item.type === "loading";
    
    let colorClass = "bg-slate-800 text-white shadow-slate-800/20";
    
    if (isSuccess) {
      colorClass = "bg-emerald-500 text-white shadow-emerald-500/30";
    } else if (isError) {
      colorClass = "bg-rose-500 text-white shadow-rose-500/30";
    } else if (isLoading) {
      colorClass = "bg-blue-500 text-white shadow-blue-500/30";
    }

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        className={`pointer-events-auto flex items-center justify-between gap-3 overflow-hidden rounded-full px-4 py-3 shadow-lg ring-1 ring-white/10 ${colorClass}`}
      >
        <div className="flex items-center gap-2.5">
          {isLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
          <span className="text-[13px] font-semibold tracking-wide">{item.title}</span>
        </div>
        <button onClick={onClose} className="p-0.5 text-white/70 transition-colors hover:text-white rounded-full">
          <X className="h-3.5 w-3.5" />
        </button>
      </motion.div>
    );
  }
);
NotificationCard.displayName = "NotificationCard";
