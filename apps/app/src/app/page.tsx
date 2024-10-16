import { deleteSessionTokenCookie, getCurrentSession } from "@blade/auth/next";
import { db } from "@blade/db/client";
import { Button } from "@blade/ui/button";

export default async function HomePage() {
  const { user } = await getCurrentSession();

  const users = await db.query.UserTable.findMany();
  return (
    <main>
      {user === null ? (
        <a href="/login/discord">Sign Up with Discord</a>
      ) : (
        <form>
          <Button
            // eslint-disable-next-line @typescript-eslint/require-await
            formAction={async () => {
              "use server";

              deleteSessionTokenCookie();
            }}
          >
            Sign Out
          </Button>
        </form>
      )}
      <div>{JSON.stringify(user, null, 2)}</div>
      <div>{JSON.stringify(users, null, 2)}</div>
    </main>
  );
}
