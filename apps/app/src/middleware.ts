import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Extend the session cookie expiration on every GET request
  if (request.method === "GET") {
    const response = NextResponse.next();
    const token = request.cookies.get("session")?.value ?? null;
    if (token !== null) {
      // Only extend cookie expiration on GET requests since we can be sure
      // a new session wasn't set when handling the request.
      response.cookies.set("session", token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        httpOnly: true,
        // eslint-disable-next-line no-restricted-properties -- We can't use the @t3-oss/env-nextjs here
        secure: process.env.NODE_ENV === "production",
      });
    }
    return response;
  }

  // Protect against CSRF attacks by checking the Origin header against the Host header
  const originHeader = request.headers.get("Origin");
  const hostHeader = request.headers.get("Host");
  if (originHeader === null || hostHeader === null) {
    return new NextResponse(null, {
      status: 403,
    });
  }
  let origin: URL;
  try {
    origin = new URL(originHeader);
  } catch {
    return new NextResponse(null, {
      status: 403,
    });
  }
  if (origin.host !== hostHeader) {
    return new NextResponse(null, {
      status: 403,
    });
  }
  return NextResponse.next();
}
