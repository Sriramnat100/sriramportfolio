"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import type { FeatureCollection, Geometry, MultiPolygon, Polygon } from "geojson";
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

// Only record one ping per browser per 24h so reloads don't spam the map.
const PING_KEY = "visitor_ping_at";
const PING_TTL_MS = 24 * 60 * 60 * 1000;

// Equirectangular projection into a 2:1 box, with unused polar latitudes
// cropped (nothing interesting above 84°N / below 60°S on a visitor map).
const LAT_TOP = 84;
const LAT_BOTTOM = -60;
function project(lat: number, lon: number) {
  const x = (lon + 180) / 360;
  const y = (LAT_TOP - lat) / (LAT_TOP - LAT_BOTTOM);
  return { x, y };
}

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pings, setPings] = useState<Ping[]>([]);
  const [you, setYou] = useState<Ping | null>(null);
  const [hovered, setHovered] = useState<Ping | null>(null);

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

  // Draw the world landmass silhouette once the topojson loads.
  useEffect(() => {
    let cancelled = false;

    const draw = async () => {
      const canvas = canvasRef.current;
      const wrap = wrapRef.current;
      if (!canvas || !wrap) return;

      const res = await fetch("/map/land-110m.json");
      const topo = (await res.json()) as Topology;
      if (cancelled) return;

      const land = feature(
        topo,
        topo.objects.land
      ) as unknown as FeatureCollection<Geometry>;

      const render = () => {
        const w = wrap.clientWidth;
        const h = w / 2.2; // slightly wider than 2:1 since we cropped the poles
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.height = `${h}px`;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        ctx.fillStyle = "rgba(148, 197, 253, 0.16)";
        ctx.strokeStyle = "rgba(148, 197, 253, 0.28)";
        ctx.lineWidth = 0.6;

        const drawRing = (ring: number[][]) => {
          ring.forEach(([lon, lat], i) => {
            const { x, y } = project(lat, lon);
            if (i === 0) ctx.moveTo(x * w, y * h);
            else ctx.lineTo(x * w, y * h);
          });
        };

        for (const f of land.features) {
          const geom = f.geometry as Polygon | MultiPolygon;
          ctx.beginPath();
          if (geom.type === "Polygon") {
            for (const ring of geom.coordinates) drawRing(ring);
          } else {
            for (const poly of geom.coordinates) for (const ring of poly) drawRing(ring);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      };

      render();
      const onResize = () => render();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    };

    const cleanup = draw();
    return () => {
      cancelled = true;
      cleanup.then((fn) => fn?.());
    };
  }, []);

  const uniqueCountries = new Set(
    pings.map((p) => p.country_code).filter(Boolean)
  ).size;

  return (
    <div>
      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 p-0 shadow-2xl"
      >
        <canvas ref={canvasRef} className="block w-full" />

        {/* Pins (absolutely positioned over the canvas) */}
        {pings.map((p) => {
          const { x, y } = project(p.lat, p.lon);
          if (y < 0 || y > 1) return null;
          const isYou = you?.id === p.id;
          return (
            <button
              key={p.id}
              onMouseEnter={() => setHovered(p)}
              onMouseLeave={() => setHovered((h) => (h?.id === p.id ? null : h))}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
              aria-label={`Visitor from ${p.city ?? "somewhere"}, ${p.country ?? ""}`}
            >
              {isYou ? (
                <span className="relative flex h-4 w-4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-60" />
                  <span className="relative inline-flex h-4 w-4 rounded-full bg-orange-400 ring-2 ring-orange-200/60" />
                </span>
              ) : (
                <span className="block h-2 w-2 rounded-full bg-cyan-300/90 shadow-[0_0_8px_rgba(103,232,249,0.9)] transition-transform hover:scale-150" />
              )}
            </button>
          );
        })}

        {/* Hover tooltip */}
        {hovered && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[130%] whitespace-nowrap rounded-lg border border-cyan-300/40 bg-slate-900/95 px-3 py-1.5 text-xs font-medium text-cyan-100 shadow-xl"
            style={{
              left: `${project(hovered.lat, hovered.lon).x * 100}%`,
              top: `${project(hovered.lat, hovered.lon).y * 100}%`,
            }}
          >
            {[hovered.city, hovered.country].filter(Boolean).join(", ") || "Somewhere on Earth"}
            <span className="ml-2 text-cyan-300/60">
              {new Date(hovered.created_at).toLocaleDateString(undefined, {
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
            <span>Every visitor drops a pin — cyan dots are past visitors.</span>
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
