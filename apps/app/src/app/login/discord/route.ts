import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Discord, generateState } from "arctic";
import { env } from "env";

export function GET() {
  const state = generateState();
  const discord = new Discord(
    env.DISCORD_CLIENT_ID,
    env.DISCORD_CLIENT_SECRET,
    env.DISCORD_REDIRECT_URI,
  );
  const url = discord.createAuthorizationURL(state, ["identify"]);

  cookies().set("discord_oauth_state", state, {
    path: "/",
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax",
  });

  return NextResponse.redirect(url, { status: 302 });
}
