import fs from "fs";
import path from "path";
import type { AppConfig } from "../types";

const CONFIG_PATH = path.resolve(__dirname, "../../../config.json");

export function loadConfig(): AppConfig {
  const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
  return JSON.parse(raw) as AppConfig;
}

export const config: AppConfig = loadConfig();
