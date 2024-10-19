import { cache } from "react";
import { cookies } from "next/headers";

import type { SessionValidationResult } from ".";
import { validateSession } from ".";

export function setSessionTokenCookie(token: string, expires: Date): void {
  cookies().set("session", token, {
    httpOnly: true,

    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });
}

export function deleteSessionTokenCookie(): void {
  cookies().set("session", "", {
    httpOnly: true,

    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: 0,
    path: "/",
  });
}

export const getCurrentSession = cache(
  async (): Promise<SessionValidationResult> => {
    const token = cookies().get("session")?.value ?? null;
    if (token === null) {
      return { session: null, user: null };
    }
    const result = await validateSession(token);
    return result;
  },
);
