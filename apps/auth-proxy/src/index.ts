import {
  ArcticFetchError,
  createSession,
  Discord,
  generateSessionToken,
  generateState,
  OAuth2RequestError,
  OAuth2Tokens,
} from "@blade/auth";
import { createD1DrizzleClient } from "@blade/db/client";
import { UserTable } from "@blade/db/schema";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";

type Bindings = {
  DB: D1Database;
  DISCORD_CLIENT_SECRET: string;
  DISCORD_CLIENT_ID: string;
};

type Variables = {
  DISCORD: Discord;
  REDIRECT_URI: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use("/login/discord", async (c, next) => {
  const discord = new Discord(
    c.env.DISCORD_CLIENT_ID,
    c.env.DISCORD_CLIENT_SECRET,
    "http://localhost:3001/login/discord/callback",
  );

  console.log("Discord", discord);

  c.set("DISCORD", discord);

  return await next();
});

app.get("/login/discord", async (c) => {
  const state = generateState();
  const url = c.get("DISCORD").createAuthorizationURL(state, ["identify"]);
  console.log("URL", url.toString());

  setCookie(c, "discord_oauth_state", state, {
    path: "/",
    httpOnly: true,
    secure: true,
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax",
  });

  return c.redirect(url.toString(), 301);
});

app.get("/login/discord/callback", async (c) => {
  const db = createD1DrizzleClient(c.env.DB);

  const discord = new Discord(
    c.env.DISCORD_CLIENT_ID,
    c.env.DISCORD_CLIENT_SECRET,
    "http://localhost:3001/login/discord/callback",
  );

  const code = c.req.query("code");
  const state = c.req.query("state");
  const storedState = getCookie(c, "discord_oauth_state");
  if (code === undefined || state === undefined || storedState === undefined) {
    return c.text("Invalid request", { status: 400 });
  }
  if (state !== storedState) {
    return c.text("Invalid state", { status: 400 });
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

      setCookie(c, "session", sessionToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        expires: session.expiresAt,
        path: "/",
      });
      return c.redirect(c.env.DISCORD_CLIENT_ID);
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
      return c.text("Failed to create user", { status: 500 });
    }

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id, db);

    setCookie(c, "session", sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      expires: session.expiresAt,
      path: "/",
    });
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      return c.json({ error: e.message }, 500);
    }
    if (e instanceof ArcticFetchError) {
      return c.json({ error: e.message }, 500);
    }
  }

  return c.redirect(c.var.REDIRECT_URI);
});

export default app;
