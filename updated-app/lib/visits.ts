import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { createHash } from "crypto";

// Visit log for the private /visitors page. One row per browser session,
// updated as the visitor moves through the site. Stored in Neon Postgres
// (added from Vercel → Storage), which sets DATABASE_URL. The client is
// created on first use so `next build` works without the variable.
let client: NeonQueryFunction<false, false> | null = null;
let ready: Promise<unknown> | null = null;

export function visitsDb(): NeonQueryFunction<false, false> {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("Visit log is not configured: set DATABASE_URL.");
    client = neon(url);
  }
  return client;
}

// Creates the table the first time a server instance touches it.
export function ensureVisitsTable(): Promise<unknown> {
  if (!ready) {
    const sql = visitsDb();
    ready = sql`
      CREATE TABLE IF NOT EXISTS visits (
        session_id       text PRIMARY KEY,
        visitor_id       text,
        visit_number     int,
        started_at       timestamptz NOT NULL DEFAULT now(),
        last_seen        timestamptz NOT NULL DEFAULT now(),
        ip               text,
        org              text,
        asn              text,
        is_hosting       boolean NOT NULL DEFAULT false,
        city             text,
        region           text,
        country          text,
        postal           text,
        timezone         text,
        referrer         text,
        utm_source       text,
        utm_medium       text,
        utm_campaign     text,
        landing_page     text,
        pages            jsonb NOT NULL DEFAULT '[]',
        clicks           jsonb NOT NULL DEFAULT '[]',
        max_scroll       int NOT NULL DEFAULT 0,
        duration_seconds int NOT NULL DEFAULT 0,
        device           text,
        browser          text,
        os               text,
        screen           text,
        language         text,
        user_agent       text
      )`.catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}

export type Visit = {
  session_id: string;
  visitor_id: string | null;
  visit_number: number | null;
  started_at: string;
  last_seen: string;
  ip: string | null;
  org: string | null;
  asn: string | null;
  is_hosting: boolean;
  city: string | null;
  region: string | null;
  country: string | null;
  postal: string | null;
  timezone: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  landing_page: string | null;
  pages: { path: string; at: string }[];
  clicks: { label: string; href: string; at: string }[];
  max_scroll: number;
  duration_seconds: number;
  device: string | null;
  browser: string | null;
  os: string | null;
  screen: string | null;
  language: string | null;
  user_agent: string | null;
};

// The /visitors password is chosen on the page itself the first time it's
// opened, and only its hash is stored. The login cookie holds a hash of that
// hash, and the same cookie keeps the owner's own visits out of the log.
export const OWNER_COOKIE = "visitors_owner";

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
export const hashPassword = (password: string) => sha256(`visitors:${password}`);

let cachedHash: string | null = null;

export async function passwordHash(): Promise<string | null> {
  if (cachedHash) return cachedHash;
  if (!process.env.DATABASE_URL) return null;
  const sql = visitsDb();
  await sql`CREATE TABLE IF NOT EXISTS visitors_settings (key text PRIMARY KEY, value text NOT NULL)`;
  const rows = await sql`SELECT value FROM visitors_settings WHERE key = 'password_hash'`;
  cachedHash = (rows[0]?.value as string | undefined) ?? null;
  return cachedHash;
}

// Stores the first password set; returns false if one already exists.
export async function setPasswordHash(hash: string): Promise<boolean> {
  const sql = visitsDb();
  await passwordHash();
  const rows = await sql`
    INSERT INTO visitors_settings (key, value) VALUES ('password_hash', ${hash})
    ON CONFLICT (key) DO NOTHING RETURNING value`;
  if (rows.length) cachedHash = hash;
  return rows.length > 0;
}

export async function ownerToken(): Promise<string | null> {
  const hash = await passwordHash();
  return hash ? sha256(`owner:${hash}`) : null;
}
