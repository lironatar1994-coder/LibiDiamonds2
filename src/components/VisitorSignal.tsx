"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const VISITOR_KEY = "libi.analytics.visitor";
const SESSION_KEY = "libi.analytics.session";
const LAST_SIGNAL_KEY = "libi.analytics.last-signal";
const VISITOR_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function randomId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`;
}

function getVisitorId() {
  const now = Date.now();
  try {
    const stored = JSON.parse(localStorage.getItem(VISITOR_KEY) || "null") as
      | { id?: string; expiresAt?: number }
      | null;
    if (stored?.id && Number(stored.expiresAt) > now) return stored.id;
    const id = randomId();
    localStorage.setItem(VISITOR_KEY, JSON.stringify({ id, expiresAt: now + VISITOR_TTL_MS }));
    return id;
  } catch {
    return randomId();
  }
}

function getSessionId() {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) return stored;
    const id = randomId();
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return randomId();
  }
}

function recentlySignaled(path: string) {
  try {
    const stored = JSON.parse(sessionStorage.getItem(LAST_SIGNAL_KEY) || "null") as
      | { path?: string; at?: number }
      | null;
    const duplicate = stored?.path === path && Date.now() - Number(stored?.at || 0) < 3000;
    if (!duplicate) sessionStorage.setItem(LAST_SIGNAL_KEY, JSON.stringify({ path, at: Date.now() }));
    return duplicate;
  } catch {
    return false;
  }
}

export default function VisitorSignal() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || recentlySignaled(pathname)) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4000);
    const payload = {
      event_id: randomId(),
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      path: pathname,
      webdriver: navigator.webdriver === true,
    };

    void fetch("/api/visit-signal", {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    }).catch(() => undefined).finally(() => window.clearTimeout(timeout));

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [pathname]);

  return null;
}
