/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import type { Session } from "@forge/auth";
import { auth, validateToken } from "@forge/auth";
import {
  DISCORD_ADMIN_ROLE_ID,
  KNIGHTHACKS_GUILD_ID,
} from "@forge/consts/knight-hacks";

import { env } from "./env";

interface DiscordMember {
  avatar: string | null;
  banner: string | null;
  communication_disabled_until: string | null;
  flags: number;
  joined_at: string;
  nick: string;
  pending: boolean;
  premium_since: string | null;
  roles: string[];
  unusual_dm_activity_until: string | null;
  user: {
    id: string;
    username: string;
    avatar: string | null;
    discriminator: string;
    public_flags: number;
    flags: number;
    banner: string | null;
    accent_color: number | null;
    global_name: string | null;
    avatar_decoration_data?: string;
    banner_color: string | null;
    clan?: string;
    primary_guild?: string;
  };
  mute: boolean;
  deaf: boolean;
}

/**
 * Isomorphic Session getter for API requests
 * - Expo requests will have a session token in the Authorization header
 * - Next.js requests will have a session token in cookies
 */
const isomorphicGetSession = async (headers: Headers) => {
  const authToken = headers.get("Authorization") ?? null;
  if (authToken) return validateToken(authToken);
  return auth();
};

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: {
  headers: Headers;
  session: Session | null;
}) => {
  const authToken = opts.headers.get("Authorization") ?? null;
  const session = await isomorphicGetSession(opts.headers);
  const source = opts.headers.get("x-trpc-source") ?? "unknown";
  console.log(">>> tRPC Request from", source, "by", session?.user);

  return {
    session,
    opts,
    token: authToken,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
    },
  }),
});

/**
 * Create a server-side caller
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an articifial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev 100-500ms
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

const isAdmin = async (user: Session["user"]) => {
  try {
    const url = `https://discord.com/api/v10/guilds/${KNIGHTHACKS_GUILD_ID}/members/${user.discordUserId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
      },
    });

    const data = (await response.json()) as DiscordMember;

    console.log("Member Info:", data);

    if (data.roles.includes(DISCORD_ADMIN_ROLE_ID)) {
      return true;
    }

    return false;
  } catch (error) {
    console.log("err: ", error);
    return false;
  }
};

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const isValidAdmin = await isAdmin(ctx.session.user);
  if (!isValidAdmin) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});
