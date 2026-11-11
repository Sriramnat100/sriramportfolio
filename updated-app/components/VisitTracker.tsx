"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Reports each visit to /api/visit for the private /visitors page: where the
// visitor came from, the pages they open, the links they click, how far they
// scroll and how long they stay. Storage access can throw in private windows,
// so every read and write falls back to a throwaway id.

function stored(storage: () => Storage, key: string, make: () => string): string {
  try {
    const existing = storage().getItem(key);
    if (existing) return existing;
    const value = make();
    storage().setItem(key, value);
    return value;
  } catch {
    return make();
  }
}

function send(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon?.("/api/visit", body)) return;
  fetch("/api/visit", { method: "POST", body, keepalive: true }).catch(() => {});
}

export function VisitTracker() {
  const pathname = usePathname();
  const session = useRef<string | null>(null);

  useEffect(() => {
    const newId = () => crypto.randomUUID();
    const visitorId = stored(() => localStorage, "vt_visitor", newId);
    let isNew = false;
    const sessionId = stored(() => sessionStorage, "vt_session", () => {
      isNew = true;
      return newId();
    });
    session.current = sessionId;

    if (isNew) {
      let visitNumber = 1;
      try {
        visitNumber = Number(localStorage.getItem("vt_visits") || 0) + 1;
        localStorage.setItem("vt_visits", String(visitNumber));
      } catch {}
      const params = new URLSearchParams(location.search);
      send({
        type: "start",
        sessionId,
        visitorId,
        visitNumber,
        path: location.pathname + location.hash,
        referrer: document.referrer || null,
        utm: {
          source: params.get("utm_source"),
          medium: params.get("utm_medium"),
          campaign: params.get("utm_campaign"),
        },
        screen: `${screen.width}x${screen.height}`,
        language: navigator.language,
      });
    }

    const startedAt = Date.now();
    let elapsedBefore = 0;
    try {
      elapsedBefore = Number(sessionStorage.getItem("vt_elapsed") || 0);
    } catch {}
    let maxScroll = 0;

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const pct = max > 0 ? (scrollY / max) * 100 : 100;
      if (pct > maxScroll) maxScroll = pct;
    };
    const ping = () => {
      const duration = elapsedBefore + (Date.now() - startedAt) / 1000;
      try {
        sessionStorage.setItem("vt_elapsed", String(duration));
      } catch {}
      send({ type: "ping", sessionId, scroll: maxScroll, duration });
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      const label = (a.textContent || a.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ");
      send({ type: "click", sessionId, label, href: a.getAttribute("href") || "" });
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") ping();
    };

    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick, true);
    document.addEventListener("visibilitychange", onHide);
    addEventListener("pagehide", ping);
    const timer = setInterval(ping, 15000);
    return () => {
      removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("visibilitychange", onHide);
      removeEventListener("pagehide", ping);
      clearInterval(timer);
    };
  }, []);

  // Later page changes within the same session (the first is in "start").
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (session.current) send({ type: "page", sessionId: session.current, path: pathname });
  }, [pathname]);

  return null;
}
