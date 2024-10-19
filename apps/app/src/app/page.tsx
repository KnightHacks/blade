import { db } from "@blade/db/client";

export const runtime = "edge";

export default async function HomePage() {
  const users = await db.query.UserTable.findMany();
  return (
    <main>
      <div>
        <a href="/login/discord">Login with Discord</a>
      </div>

      {JSON.stringify(users)}
    </main>
  );
}
