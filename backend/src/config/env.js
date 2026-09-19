import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Loaded once, as early as possible: any module that imports this file is
// guaranteed to see process.env values (ESM imports are evaluated in order).
// The path is resolved from this file, so the server works no matter which
// directory node is started from.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Guard: importing this module from several places must not load .env twice
if (!globalThis.__ILAM_ENV_LOADED__) {
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
  globalThis.__ILAM_ENV_LOADED__ = true;
}