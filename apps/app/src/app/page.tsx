import {
  deleteSessionTokenCookie,
  getCurrentSession,
  invalidateSession,
} from "@blade/auth";
import { Button } from "@blade/ui/button";

import { api } from "~/trpc/server";

export const runtime = "edge";

export default async function HomePage() {
  const { session } = await getCurrentSession();
  let secret: string;
  try {
    secret = await api.auth.getSecretMessage();
  } catch {
    secret = "you are not allowed to see the secret message!";
  }
  return (
    <main>
      {session === null ? (
        <a href="/login/discord">Login with Discord</a>
      ) : (
        <form>
          <Button
            formAction={async () => {
              "use server";
              await invalidateSession(session.id);
              deleteSessionTokenCookie();
            }}
          >
            Logout
          </Button>
        </form>
      )}
      <div>{secret}</div>
    </main>
  );
}
