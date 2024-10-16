import type { DiscordTokens } from "arctic";
import { cookies } from "next/headers";

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
    return new Response(null, {
      status: 400,
    });
  }
  if (state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  let tokens: DiscordTokens;
  try {
    tokens = await discord.validateAuthorizationCode(code);
  } catch {
    // Invalid code or client credentials
    return new Response(null, {
      status: 400,
    });
  }

  const discordUserResponse = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });
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
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
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
    return new Response(null, {
      status: 500,
    });
  }

  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, user.id);
  setSessionTokenCookie(sessionToken, session.expiresAt);
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
    },
  });
}
