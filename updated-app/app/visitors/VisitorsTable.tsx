"use client";

import { Fragment, useMemo, useState } from "react";
import type { Visit } from "@/lib/visits";
import styles from "./visitors.module.css";

// Internet providers and mobile carriers: visits from these are people at
// home or on a phone, so the org says nothing about where they work.
const CONSUMER_ISP = /comcast|charter|spectrum|verizon|at&t|att |t-mobile|sprint|cox|centurylink|lumen|frontier|optimum|altice|windstream|mediacom|rcn|wow|starlink|rogers|bell canada|telus|shaw|vodafone|bt |sky |virgin|orange|jio|airtel|bsnl|telstra|optus|mobile|wireless|cable|broadband|telecom|communications/i;

type Kind = "company" | "isp" | "hosting" | "unknown";

function kind(v: Visit): Kind {
  if (v.is_hosting) return "hosting";
  if (!v.org) return "unknown";
  return CONSUMER_ISP.test(v.org) ? "isp" : "company";
}

function source(v: Visit): string {
  if (v.utm_source) return v.utm_source;
  if (!v.referrer) return "direct";
  try {
    return new URL(v.referrer).hostname.replace(/^www\./, "");
  } catch {
    return v.referrer;
  }
}

function duration(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}m ${s % 60}s` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export function VisitorsTable({ visits }: { visits: Visit[] }) {
  const [query, setQuery] = useState("");
  const [src, setSrc] = useState("all");
  const [days, setDays] = useState("all");
  const [companiesOnly, setCompaniesOnly] = useState(false);
  const [hideHosting, setHideHosting] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  const sources = useMemo(() => [...new Set(visits.map(source))].sort(), [visits]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const since = days === "all" ? 0 : Date.now() - Number(days) * 86400000;
    return visits.filter((v) => {
      const k = kind(v);
      if (hideHosting && k === "hosting") return false;
      if (companiesOnly && k !== "company") return false;
      if (src !== "all" && source(v) !== src) return false;
      if (since && new Date(v.started_at).getTime() < since) return false;
      if (q) {
        const hay = [v.org, v.city, v.region, v.country, v.referrer, v.utm_source, v.utm_campaign, v.ip]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [visits, query, src, days, companiesOnly, hideHosting]);

  const companies = shown.filter((v) => kind(v) === "company").length;
  const people = new Set(shown.map((v) => v.visitor_id)).size;

  return (
    <>
      <div className={styles.stats}>
        <span><b>{shown.length}</b> visits</span>
        <span><b>{people}</b> people</span>
        <span><b>{companies}</b> from companies / schools</span>
      </div>

      <div className={styles.filters}>
        <input placeholder="Search org, city, source…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={src} onChange={(e) => setSrc(e.target.value)}>
          <option value="all">All sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={days} onChange={(e) => setDays(e.target.value)}>
          <option value="all">All time</option>
          <option value="1">Last 24 hours</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
        </select>
        <label><input type="checkbox" checked={companiesOnly} onChange={(e) => setCompaniesOnly(e.target.checked)} /> Companies only</label>
        <label><input type="checkbox" checked={hideHosting} onChange={(e) => setHideHosting(e.target.checked)} /> Hide bots / VPNs</label>
      </div>

      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>When</th>
              <th>Organization</th>
              <th>Location</th>
              <th>Source</th>
              <th>Time</th>
              <th>Scroll</th>
              <th>Clicks</th>
              <th>Device</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((v) => {
              const k = kind(v);
              const isOpen = open === v.session_id;
              return (
                <Fragment key={v.session_id}>
                  <tr className={styles.row} onClick={() => setOpen(isOpen ? null : v.session_id)}>
                    <td>{when(v.started_at)}</td>
                    <td>
                      <span className={k === "company" ? styles.company : k === "hosting" ? styles.muted : undefined}>
                        {v.org ?? "Unknown"}
                      </span>
                      {k === "hosting" && <span className={styles.tag}>bot/VPN</span>}
                      {(v.visit_number ?? 1) > 1 && <span className={styles.tag}>visit #{v.visit_number}</span>}
                    </td>
                    <td>{[v.city, v.region, v.country].filter(Boolean).join(", ") || "—"}</td>
                    <td>{source(v)}{v.utm_campaign ? ` · ${v.utm_campaign}` : ""}</td>
                    <td>{duration(v.duration_seconds)}</td>
                    <td>{v.max_scroll}%</td>
                    <td>{v.clicks.length || "—"}</td>
                    <td>{[v.device, v.browser].filter(Boolean).join(" · ")}</td>
                  </tr>
                  {isOpen && (
                    <tr className={styles.detail}>
                      <td colSpan={8}>
                        <dl>
                          <dt>Referrer</dt><dd>{v.referrer ?? "direct"}</dd>
                          <dt>UTM</dt><dd>{[v.utm_source, v.utm_medium, v.utm_campaign].filter(Boolean).join(" / ") || "—"}</dd>
                          <dt>Pages</dt><dd>{v.pages.map((p) => p.path).join(" → ") || "—"}</dd>
                          <dt>Clicked</dt>
                          <dd>{v.clicks.length ? v.clicks.map((c, i) => <div key={i}>{c.label || c.href} <span className={styles.muted}>{c.href}</span></div>) : "—"}</dd>
                          <dt>Network</dt><dd>{[v.org, v.asn, v.ip].filter(Boolean).join(" · ") || "—"}</dd>
                          <dt>Place</dt><dd>{[v.city, v.region, v.postal, v.country, v.timezone].filter(Boolean).join(", ") || "—"}</dd>
                          <dt>Setup</dt><dd>{[v.device, v.browser, v.os, v.screen, v.language].filter(Boolean).join(" · ")}</dd>
                          <dt>Visitor</dt><dd>{v.visitor_id ?? "—"} (visit #{v.visit_number ?? 1})</dd>
                          <dt>Last seen</dt><dd>{when(v.last_seen)}</dd>
                        </dl>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {!shown.length && <p className={styles.note}>No visits yet.</p>}
      </div>
    </>
  );
}
