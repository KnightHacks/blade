import { deleteSessionTokenCookie, getCurrentSession } from "@acme/auth/next";
import { Button } from "@acme/ui/button";

export default async function HomePage() {
  const { user } = await getCurrentSession();
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
    </main>
  );
}
