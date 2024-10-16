import type { OAuth2Tokens } from "arctic";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ArcticFetchError, OAuth2RequestError } from "arctic";

import { createSession, generateSessionToken } from "@acme/auth";
import { setSessionTokenCookie } from "@acme/auth/next";
import { discord } from "@acme/auth/oauth";
import { db } from "@acme/db/client";
import { UserTable } from "@acme/db/schema";

export async function GET(request: Request): Promise<Response> {
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

    const discordUser = (await discordUserResponse.json()) as {
      id: string;
      username: string;
    };

    const discordUserId = discordUser.id;
    const discordUsername = discordUser.username;

    const existingUser = await db.query.UserTable.findFirst({
      where: (user, t) => t.eq(user.discordId, discordUserId),
    });

    if (existingUser) {
      const sessionToken = generateSessionToken();
      const session = await createSession(sessionToken, existingUser.id);
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
    const session = await createSession(sessionToken, user.id);
    setSessionTokenCookie(sessionToken, session.expiresAt);
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      return NextResponse.json({ error: e.message });
    }
    if (e instanceof ArcticFetchError) {
      return NextResponse.json({ error: e.message });
    }
  }

  return NextResponse.redirect(new URL("/", request.url));
}
