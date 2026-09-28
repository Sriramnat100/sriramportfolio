import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// One Supabase client for the API routes, created on first use rather than
// when a route module loads. Next.js loads route modules while it collects
// page data during `next build`, so an eager client made the whole build
// fail on any project where these variables weren't set.
let client: SupabaseClient | null = null;

export function supabaseServer(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    }
    client = createClient(url, key);
  }
  return client;
}
