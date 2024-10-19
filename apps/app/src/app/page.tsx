import { db } from "@blade/db/client";
import { Button } from "@blade/ui/button";

import { deleteSessionTokenCookie, getCurrentSession } from "./utils";

export const runtime = "edge";

export default async function HomePage() {
  const { session } = await getCurrentSession();
  const users = await db.query.UserTable.findMany();
  return (
    <main>
      {session === null ? (
        <a href="/login/discord">Login with Discord</a>
      ) : (
        <form>
          <Button
            // eslint-disable-next-line @typescript-eslint/require-await -- form actions must be async
            formAction={async () => {
              "use server";
              deleteSessionTokenCookie();
            }}
          >
            Logout
          </Button>
        </form>
      )}
      <div>{JSON.stringify(users)}</div>
    </main>
  );
}
