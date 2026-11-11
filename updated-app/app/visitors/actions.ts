"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hashPassword, OWNER_COOKIE, ownerToken, passwordHash, setPasswordHash } from "@/lib/visits";

async function signIn() {
  const token = await ownerToken();
  if (!token) redirect("/visitors?error=1");
  (await cookies()).set(OWNER_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect("/visitors");
}

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const stored = await passwordHash();
  if (!stored || hashPassword(password) !== stored) redirect("/visitors?error=1");
  await signIn();
}

// First visit only: the password chosen here becomes the page's password.
export async function createPassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) redirect("/visitors?error=short");
  if (!(await setPasswordHash(hashPassword(password)))) redirect("/visitors?error=taken");
  await signIn();
}

export async function logout() {
  (await cookies()).delete(OWNER_COOKIE);
  redirect("/visitors");
}
