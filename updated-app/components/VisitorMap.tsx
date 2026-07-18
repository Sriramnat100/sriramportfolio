"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import type { FeatureCollection, Geometry } from "geojson";
import { geoOrthographic, geoPath, geoGraticule10, geoDistance } from "d3-geo";
import { MapPin } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Ping = {
  id: string;
  city: string | null;
  country: string | null;
  country_code: string | null;
  lat: number;
  lon: number;
  created_at: string;
};

// Only record one ping per browser per 24h so reloads don't spam the globe.
const PING_KEY = "visitor_ping_at";
const PING_TTL_MS = 24 * 60 * 60 * 1000;

async function lookupGeo(): Promise<Omit<Ping, "id" | "created_at"> | null> {
  // Primary: ipwho.is (free, CORS-enabled). Fallback: ipapi.co.
  try {
    const r = await fetch("https://ipwho.is/");
    const d = await r.json();
    if (d && d.success !== false && typeof d.latitude === "number") {
      return {
        city: d.city ?? null,
        country: d.country ?? null,
        country_code: d.country_code ?? null,
        lat: d.latitude,
        lon: d.longitude,
      };
    }
  } catch {}
  try {
    const r = await fetch("https://ipapi.co/json/");
    const d = await r.json();
    if (d && typeof d.latitude === "number") {
      return {
        city: d.city ?? null,
        country: d.country_name ?? null,
        country_code: d.country_code ?? null,
        lat: d.latitude,
        lon: d.longitude,
      };
    }
  } catch {}
  return null;
}

export default function VisitorMap() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pings, setPings] = useState<Ping[]>([]);
  const [you, setYou] = useState<Ping | null>(null);
  const [hovered, setHovered] = useState<{ ping: Ping; x: number; y: number } | null>(null);
  const [land, setLand] = useState<FeatureCollection<Geometry> | null>(null);

  // Refs so the render loop always sees fresh data without re-running effects.
  const pingsRef = useRef<Ping[]>([]);
  const youIdRef = useRef<string | null>(null);
  pingsRef.current = pings;
  youIdRef.current = you?.id ?? null;

  // Record this visit (once per day per browser), then load recent pings.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const last = Number(localStorage.getItem(PING_KEY) || 0);
        if (Date.now() - last > PING_TTL_MS) {
          const geo = await lookupGeo();
          if (geo && !cancelled) {
            localStorage.setItem(PING_KEY, String(Date.now()));
            const { data } = await supabase
              .from("visitor_pings")
              .insert(geo)
              .select()
              .single();
            if (data && !cancelled) setYou(data as Ping);
          }
        }
      } catch {}

      const { data } = await supabase
        .from("visitor_pings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);
      if (data && !cancelled) setPings(data as Ping[]);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load the landmass topojson once.
  useEffect(() => {
    let cancelled = false;
    fetch("/map/land-110m.json")
      .then((r) => r.json())
      .then((topo: Topology) => {
        if (!cancelled) {
          setLand(
            feature(topo, topo.objects.land) as unknown as FeatureCollection<Geometry>
          );
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // The globe: orthographic projection, auto-rotates, drag to spin.
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || !land) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const graticule = geoGraticule10();

    // Start centered on the Americas; most early pins will be US.
    const rot = { lambda: 100, phi: -22 };
    const drag = { active: false, x: 0, y: 0, moved: false };
    let lastInteract = 0;

    // Screen positions of visible pins, refreshed every frame (for hover hit-testing).
    let projected: { x: number; y: number; ping: Ping }[] = [];

    let size = 0;
    let dpr = 1;
    const measure = () => {
      size = Math.min(wrap.clientWidth - 16, 580);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
    };
    measure();
    window.addEventListener("resize", measure);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const render = () => {
      const t = performance.now() / 1000;

      // Gentle auto-spin, pausing briefly after the user interacts.
      if (!reduceMotion && !drag.active && performance.now() - lastInteract > 2500) {
        rot.lambda += 0.08;
      }

      const R = size / 2 - 14;
      const cx = size / 2;
      const projection = geoOrthographic()
        .translate([cx, cx])
        .scale(R)
        .rotate([rot.lambda, rot.phi])
        .clipAngle(90);
      const path = geoPath(projection, ctx);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      // Atmosphere halo
      const halo = ctx.createRadialGradient(cx, cx, R * 0.85, cx, cx, R * 1.18);
      halo.addColorStop(0, "rgba(56,189,248,0)");
      halo.addColorStop(0.72, "rgba(56,189,248,0.16)");
      halo.addColorStop(1, "rgba(56,189,248,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cx, R * 1.18, 0, Math.PI * 2);
      ctx.fill();

      // Ocean sphere with top-left light
      const ocean = ctx.createRadialGradient(
        cx - R * 0.35, cx - R * 0.4, R * 0.1,
        cx, cx, R
      );
      ocean.addColorStop(0, "#1b3a6b");
      ocean.addColorStop(0.55, "#122a52");
      ocean.addColorStop(1, "#0a1830");
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.fillStyle = ocean;
      ctx.fill();

      // Graticule
      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = "rgba(148,197,253,0.10)";
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Land
      ctx.beginPath();
      path(land);
      ctx.fillStyle = "rgba(125,177,255,0.28)";
      ctx.fill();
      ctx.strokeStyle = "rgba(164,204,255,0.45)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Limb (edge) highlight
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.strokeStyle = "rgba(125,211,252,0.55)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Pins — only on the visible hemisphere.
      const center: [number, number] = [-rot.lambda, -rot.phi];
      projected = [];
      for (const p of pingsRef.current) {
        if (geoDistance([p.lon, p.lat], center) > Math.PI / 2 - 0.06) continue;
        const pt = projection([p.lon, p.lat]);
        if (!pt) continue;
        const [x, y] = pt;
        projected.push({ x, y, ping: p });
        const isYou = youIdRef.current === p.id;
        if (isYou) {
          const pulse = reduceMotion ? 0 : (t * 0.9) % 1;
          ctx.beginPath();
          ctx.arc(x, y, 6 + pulse * 14, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(251,146,60,${0.55 * (1 - pulse)})`;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fillStyle = "#fb923c";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fillStyle = "#fff7ed";
          ctx.fill();
        } else {
          const glow = ctx.createRadialGradient(x, y, 0, x, y, 7);
          glow.addColorStop(0, "rgba(103,232,249,0.9)");
          glow.addColorStop(1, "rgba(103,232,249,0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x, y, 2.6, 0, Math.PI * 2);
          ctx.fillStyle = "#a5f3fc";
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    // Drag to spin (pointer events cover mouse + touch).
    const onDown = (e: PointerEvent) => {
      drag.active = true;
      drag.moved = false;
      drag.x = e.clientX;
      drag.y = e.clientY;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {}
    };
    const onMove = (e: PointerEvent) => {
      if (drag.active) {
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
        drag.x = e.clientX;
        drag.y = e.clientY;
        rot.lambda += dx * 0.35;
        rot.phi = Math.max(-75, Math.min(75, rot.phi - dy * 0.35));
        lastInteract = performance.now();
        setHovered(null);
        return;
      }
      // Hover hit-test against this frame's projected pins.
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      let best: { x: number; y: number; ping: Ping } | null = null;
      let bestD = 12;
      for (const pp of projected) {
        const d = Math.hypot(mx - pp.x, my - pp.y);
        if (d < bestD) {
          bestD = d;
          best = pp;
        }
      }
      setHovered((prev) => {
        if (!best) return prev ? null : prev;
        if (prev && prev.ping.id === best.ping.id) return prev;
        lastInteract = performance.now();
        return { ping: best.ping, x: best.x, y: best.y };
      });
    };
    const onUp = () => {
      drag.active = false;
      lastInteract = performance.now();
    };
    const onLeave = () => setHovered(null);

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [land]);

  const uniqueCountries = new Set(
    pings.map((p) => p.country_code).filter(Boolean)
  ).size;

  return (
    <div>
      <div
        ref={wrapRef}
        className="relative flex w-full items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 py-8 shadow-2xl"
      >
        {/* Faint starfield behind the globe */}
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 12% 22%, rgba(255,255,255,0.5) 50%, transparent 51%), radial-gradient(1px 1px at 78% 14%, rgba(255,255,255,0.4) 50%, transparent 51%), radial-gradient(1.5px 1.5px at 88% 66%, rgba(255,255,255,0.45) 50%, transparent 51%), radial-gradient(1px 1px at 30% 80%, rgba(255,255,255,0.35) 50%, transparent 51%), radial-gradient(1px 1px at 55% 40%, rgba(255,255,255,0.3) 50%, transparent 51%), radial-gradient(1.5px 1.5px at 8% 60%, rgba(255,255,255,0.4) 50%, transparent 51%), radial-gradient(1px 1px at 65% 88%, rgba(255,255,255,0.4) 50%, transparent 51%), radial-gradient(1px 1px at 42% 8%, rgba(255,255,255,0.45) 50%, transparent 51%)",
          }}
        />

        <canvas
          ref={canvasRef}
          className="relative cursor-grab touch-pan-y active:cursor-grabbing"
        />

        {/* Hover tooltip */}
        {hovered && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[150%] whitespace-nowrap rounded-lg border border-cyan-300/40 bg-slate-900/95 px-3 py-1.5 text-xs font-medium text-cyan-100 shadow-xl"
            style={{
              left: `calc(50% - ${(canvasRef.current?.clientWidth ?? 0) / 2 - hovered.x}px)`,
              top: `calc(50% - ${(canvasRef.current?.clientHeight ?? 0) / 2 - hovered.y}px)`,
            }}
          >
            {[hovered.ping.city, hovered.ping.country].filter(Boolean).join(", ") ||
              "Somewhere on Earth"}
            <span className="ml-2 text-cyan-300/60">
              {new Date(hovered.ping.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Caption row */}
      <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-blue-200">
          <MapPin className="h-4 w-4 text-orange-400" />
          {you?.city ? (
            <span>
              You just dropped a pin from{" "}
              <span className="font-semibold text-white">
                {[you.city, you.country].filter(Boolean).join(", ")}
              </span>
            </span>
          ) : (
            <span>Drag the globe — cyan dots are past visitors, orange is you.</span>
          )}
        </div>
        <div className="text-sm text-blue-300/70">
          <span className="font-semibold text-cyan-300">{pings.length}</span> recent pins ·{" "}
          <span className="font-semibold text-cyan-300">{uniqueCountries}</span>{" "}
          {uniqueCountries === 1 ? "country" : "countries"}
        </div>
      </div>
    </div>
  );
}
