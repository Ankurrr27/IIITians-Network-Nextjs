const APP_NOTIFICATION_EVENT = "iiitians:notify";

interface NotifyOptions {
  title: string;
  message?: string;
  type?: "milestone" | "post" | "legacy" | "event" | "team" | "club";
  dedupeKey?: string;
  dedupeWindowMs?: number;
}

export function notifyAppAction({
  title,
  message,
  type = "milestone",
  dedupeKey = "",
  dedupeWindowMs = 20000,
}: NotifyOptions) {
  if (typeof window === "undefined" || !title) return;

  if (dedupeKey) {
    const storageKey = `iiitians-network-toast-${dedupeKey}`;
    const lastShownAt = Number(sessionStorage.getItem(storageKey) || 0);
    if (Date.now() - lastShownAt < dedupeWindowMs) return;
    sessionStorage.setItem(storageKey, String(Date.now()));
  }

  window.dispatchEvent(
    new CustomEvent(APP_NOTIFICATION_EVENT, { detail: { title, message, type } })
  );
}

export function notifyPageEntry(title: string, message: string, dedupeKey: string) {
  notifyAppAction({ title, message, type: "milestone", dedupeKey, dedupeWindowMs: 60000 });
}

export { APP_NOTIFICATION_EVENT };
