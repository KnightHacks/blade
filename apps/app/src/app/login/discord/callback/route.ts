import type { OAuth2Tokens } from "arctic";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSession, generateSessionToken } from "@blade/auth";
import { db } from "@blade/db/client";
import { UserTable } from "@blade/db/schema";
import { Discord } from "arctic";
import { env } from "env";

import { setSessionTokenCookie } from "~/app/utils";

export const runtime = "edge";

export async function GET(request: Request): Promise<Response> {
  const discord = new Discord(
    env.DISCORD_CLIENT_ID,
    env.DISCORD_CLIENT_SECRET,
    env.DISCORD_REDIRECT_URI,
  );
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("discord_oauth_state")?.value ?? null;
  if (code === null || state === null || storedState === null) {
    return NextResponse.json(
      { error: "Invalid request" },
      {
        status: 400,
      },
    );
  }
  if (state !== storedState) {
    return NextResponse.json(
      { error: "Invalid state" },
      {
        status: 400,
      },
    );
  }

  try {
    const tokens: OAuth2Tokens = await discord.validateAuthorizationCode(code);
    const accessToken = tokens.accessToken();

    const discordUserResponse = await fetch(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const discordUser: {
      id: string;
      username: string;
    } = await discordUserResponse.json();

    const discordUserId = discordUser.id;
    const discordUsername = discordUser.username;

    const existingUser = await db.query.UserTable.findFirst({
      where: (user, t) => t.eq(user.discordId, discordUserId),
    });

    if (existingUser) {
      const sessionToken = generateSessionToken();
      const session = await createSession(sessionToken, existingUser.id, db);
      setSessionTokenCookie(sessionToken, session.expiresAt);
      return NextResponse.redirect(new URL("/", request.url));
    }

    const [user] = await db
      .insert(UserTable)
      .values({
        discordId: discordUserId,
        discordUsername: discordUsername,
      })
      .returning({
        id: UserTable.id,
      });

    if (!user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        {
          status: 500,
        },
      );
    }

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id, db);
    setSessionTokenCookie(sessionToken, session.expiresAt);
  } catch (e) {
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message });
    }
  }

  return NextResponse.redirect(new URL("/", request.url));
}
