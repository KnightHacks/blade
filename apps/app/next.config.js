import { fileURLToPath } from "url";
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";
import { createJiti } from "jiti";

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
await createJiti(fileURLToPath(import.meta.url)).import("./env");

if (process.env.NODE_ENV === "development") {
  setupDevPlatform();
}

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@blade/api",
    "@blade/auth",
    "@blade/db",
    "@blade/ui",
    "@blade/validators",
  ],

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default config;
