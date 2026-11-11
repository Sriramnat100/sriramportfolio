import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ensureVisitsTable, OWNER_COOKIE, ownerToken, visitsDb, type Visit } from "@/lib/visits";
import { createPassword, login, logout } from "./actions";
import { VisitorsTable } from "./VisitorsTable";
import styles from "./visitors.module.css";

// Private log of who has visited the site. Unlisted, kept out of search
// engines, and behind a password chosen on the first visit.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Visitors",
  robots: { index: false, follow: false },
};

export default async function VisitorsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!process.env.DATABASE_URL) {
    return (
      <main className={styles.page}>
        <div className={styles.login}>
          <h1>Visitors</h1>
          <p className={styles.note}>Connect a Neon database in Vercel (Storage) to turn this page on.</p>
        </div>
      </main>
    );
  }

  const token = await ownerToken();
  const signedIn = !!token && (await cookies()).get(OWNER_COOKIE)?.value === token;

  if (!signedIn) {
    const { error } = await searchParams;
    const firstTime = !token;
    return (
      <main className={styles.page}>
        <form action={firstTime ? createPassword : login} className={styles.login}>
          <h1>Visitors</h1>
          {firstTime && <p className={styles.note}>Choose a password for this page. You&apos;ll use it to sign in from now on.</p>}
          <input
            type="password"
            name="password"
            placeholder={firstTime ? "New password (8+ characters)" : "Password"}
            autoComplete={firstTime ? "new-password" : "current-password"}
            minLength={firstTime ? 8 : undefined}
            autoFocus
            required
          />
          {error && (
            <p className={styles.error}>
              {error === "short" ? "Use at least 8 characters." : error === "taken" ? "A password is already set." : "Wrong password."}
            </p>
          )}
          <button type="submit">{firstTime ? "Set password" : "Open"}</button>
        </form>
      </main>
    );
  }

  let visits: Visit[] = [];
  let problem: string | null = null;
  try {
    await ensureVisitsTable();
    visits = (await visitsDb()`
      SELECT * FROM visits ORDER BY started_at DESC LIMIT 1000`) as Visit[];
  } catch (err) {
    problem = err instanceof Error ? err.message : String(err);
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Visitors</h1>
        <form action={logout}>
          <button type="submit" className={styles.link}>Sign out</button>
        </form>
      </header>
      {problem ? <p className={styles.error}>{problem}</p> : <VisitorsTable visits={visits} />}
    </main>
  );
}
