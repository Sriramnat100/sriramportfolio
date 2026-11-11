import { NextRequest, NextResponse } from "next/server";
import { ensureVisitsTable, OWNER_COOKIE, ownerToken, visitsDb } from "@/lib/visits";

// Records what the VisitTracker reports: a session start, page views, link
// clicks, and periodic pings with scroll depth and time on site. Bodies come
// from navigator.sendBeacon, which posts text/plain, so they're parsed by hand.

const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|pingdom|monitor|curl|wget|python|axios|node-fetch/i;

// Networks that are data centers, clouds or VPNs rather than people.
const HOSTING_ORG = /amazon|aws|google cloud|digitalocean|hetzner|ovh|linode|akamai|vultr|oracle cloud|azure|cloudflare|leaseweb|choopa|m247|datacamp|contabo|scaleway|hosting|vpn|proxy|tor exit/i;

const clip = (v: unknown, max = 500) => (typeof v === "string" && v ? v.slice(0, max) : null);

function header(req: NextRequest, name: string): string | null {
  const v = req.headers.get(name);
  if (!v) return null;
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

function parseUserAgent(ua: string) {
  const device = /ipad|tablet/i.test(ua) ? "Tablet" : /mobi|iphone|android/i.test(ua) ? "Phone" : "Desktop";
  const browser =
    /edg\//i.test(ua) ? "Edge" :
    /opr\/|opera/i.test(ua) ? "Opera" :
    /samsungbrowser/i.test(ua) ? "Samsung Internet" :
    /firefox|fxios/i.test(ua) ? "Firefox" :
    /chrome|crios/i.test(ua) ? "Chrome" :
    /safari/i.test(ua) ? "Safari" : "Other";
  const os =
    /iphone|ipad|ipod/i.test(ua) ? "iOS" :
    /android/i.test(ua) ? "Android" :
    /mac os x/i.test(ua) ? "macOS" :
    /windows/i.test(ua) ? "Windows" :
    /cros/i.test(ua) ? "ChromeOS" :
    /linux/i.test(ua) ? "Linux" : "Other";
  return { device, browser, os };
}

// Organization behind the IP (e.g. "Google LLC", "University of Illinois").
async function lookupOrg(ip: string): Promise<{ org: string | null; asn: string | null }> {
  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}?fields=success,connection`, {
      signal: AbortSignal.timeout(2500),
    });
    const data = await res.json();
    if (!data?.success) return { org: null, asn: null };
    const c = data.connection ?? {};
    return { org: c.org || c.isp || null, asn: c.asn ? `AS${c.asn}` : null };
  } catch {
    return { org: null, asn: null };
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await req.text());
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const ua = req.headers.get("user-agent") ?? "";
  const sessionId = clip(body.sessionId, 64);
  if (!sessionId || BOT_UA.test(ua) || !process.env.DATABASE_URL) {
    return new NextResponse(null, { status: 204 });
  }
  const ownerCookie = req.cookies.get(OWNER_COOKIE)?.value;
  if (ownerCookie && ownerCookie === (await ownerToken())) return new NextResponse(null, { status: 204 });

  const sql = visitsDb();
  await ensureVisitsTable();
  const now = new Date().toISOString();

  switch (body.type) {
    case "start": {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || null;
      const { org, asn } = ip ? await lookupOrg(ip) : { org: null, asn: null };
      const { device, browser, os } = parseUserAgent(ua);
      const utm = (body.utm ?? {}) as Record<string, unknown>;
      const path = clip(body.path, 300);
      await sql`
        INSERT INTO visits (
          session_id, visitor_id, visit_number, ip, org, asn, is_hosting,
          city, region, country, postal, timezone,
          referrer, utm_source, utm_medium, utm_campaign, landing_page, pages,
          device, browser, os, screen, language, user_agent
        ) VALUES (
          ${sessionId}, ${clip(body.visitorId, 64)}, ${Number(body.visitNumber) || 1},
          ${ip}, ${org}, ${asn}, ${!!org && HOSTING_ORG.test(org)},
          ${header(req, "x-vercel-ip-city")}, ${header(req, "x-vercel-ip-country-region")},
          ${header(req, "x-vercel-ip-country")}, ${header(req, "x-vercel-ip-postal-code")},
          ${header(req, "x-vercel-ip-timezone")},
          ${clip(body.referrer)}, ${clip(utm.source, 100)}, ${clip(utm.medium, 100)}, ${clip(utm.campaign, 100)},
          ${path}, ${JSON.stringify(path ? [{ path, at: now }] : [])}::jsonb,
          ${device}, ${browser}, ${os}, ${clip(body.screen, 20)}, ${clip(body.language, 20)}, ${clip(ua)}
        )
        ON CONFLICT (session_id) DO NOTHING`;
      break;
    }
    case "page": {
      const path = clip(body.path, 300);
      if (path) {
        await sql`
          UPDATE visits SET pages = pages || ${JSON.stringify([{ path, at: now }])}::jsonb, last_seen = now()
          WHERE session_id = ${sessionId}`;
      }
      break;
    }
    case "click": {
      const click = { label: clip(body.label, 120) ?? "", href: clip(body.href, 300) ?? "", at: now };
      await sql`
        UPDATE visits SET clicks = clicks || ${JSON.stringify([click])}::jsonb, last_seen = now()
        WHERE session_id = ${sessionId}`;
      break;
    }
    case "ping": {
      const scroll = Math.min(100, Math.max(0, Math.round(Number(body.scroll) || 0)));
      const duration = Math.min(86400, Math.max(0, Math.round(Number(body.duration) || 0)));
      await sql`
        UPDATE visits SET
          max_scroll = GREATEST(max_scroll, ${scroll}),
          duration_seconds = GREATEST(duration_seconds, ${duration}),
          last_seen = now()
        WHERE session_id = ${sessionId}`;
      break;
    }
  }

  return new NextResponse(null, { status: 204 });
}
