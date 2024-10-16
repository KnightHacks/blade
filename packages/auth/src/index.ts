import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";

import type { Session, User } from "@acme/db/schema";
import { eq } from "@acme/db";
import { db } from "@acme/db/client";
import { SessionTable, UserTable } from "@acme/db/schema";

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(
  token: string,
  userId: number,
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };
  await db.insert(SessionTable).values(session);
  return session;
}

export async function validateSession(
  token: string,
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await db
    .select({ user: UserTable, session: SessionTable })
    .from(SessionTable)
    .innerJoin(UserTable, eq(SessionTable.userId, UserTable.id))
    .where(eq(SessionTable.id, sessionId));
  if (!result[0]) {
    return { session: null, user: null };
  }

  const { session } = result[0];
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(SessionTable).where(eq(SessionTable.id, sessionId));
    return { session: null, user: null };
  }
  if (Date.now() >= session.expiresAt.getTime() + 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(SessionTable)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(SessionTable.id, sessionId));
  }

  return result[0];
}

export async function invalidateSession(token: string): Promise<void> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  await db.delete(SessionTable).where(eq(SessionTable.id, sessionId));
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
