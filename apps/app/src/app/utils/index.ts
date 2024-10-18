import type { SessionValidationResult } from "@blade/auth";
import { cache } from "react";
import { cookies } from "next/headers";
import { validateSessionToken } from "@blade/auth";
import { createD1DrizzleClient } from "@blade/db/client";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const getCurrentSession = cache(
  async (): Promise<SessionValidationResult> => {
    const {
      env: { DB },
    } = getRequestContext();
    const db = createD1DrizzleClient(DB);
    const token = cookies().get("session")?.value ?? null;
    if (token === null) {
      return { session: null, user: null };
    }
    const result = await validateSessionToken(token, db);
    return result;
  },
);
