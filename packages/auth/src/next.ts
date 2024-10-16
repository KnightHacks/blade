import { cookies } from "next/headers";

export function setSessionTokenCookie(token: string, expires: Date): void {
  cookies().set("session", token, {
    httpOnly: true,
    // eslint-disable-next-line no-restricted-properties
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });
}

export function deleteSessionTokenCookie(): void {
  cookies().set("session", "", {
    httpOnly: true,
    // eslint-disable-next-line no-restricted-properties
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: 0,
    path: "/",
  });
}
