import { Discord } from "arctic";

if (!process.env.DISCORD_CLIENT_ID) {
  throw new Error("DISCORD_CLIENT_ID is required");
}

if (!process.env.DISCORD_CLIENT_SECRET) {
  throw new Error("DISCORD_CLIENT_SECRET is required");
}

if (!process.env.DISCORD_CALLBACK_URL) {
  throw new Error("DISCORD_CALL_BACK_URL is required");
}

export const discord = new Discord(
  process.env.DISCORD_CLIENT_ID,
  process.env.DISCORD_CLIENT_SECRET,
  process.env.DISCORD_CALLBACK_URL,
);
