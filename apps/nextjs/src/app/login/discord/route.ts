import { cookies } from "next/headers";
import { generateState } from "arctic";

import { discord } from "@acme/auth/oauth";

import { env } from "~/env";

export function GET() {
  const state = generateState();
  const url = discord.createAuthorizationURL(state, ["identify"]);

  cookies().set("discord_oauth_state", state, {
    path: "/",
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax",
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
    },
  });
}
