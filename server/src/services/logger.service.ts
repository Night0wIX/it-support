import fs from "fs";
import path from "path";
import winston from "winston";
import type { ILogger } from "../types";

export function createLogger(logFile: string): ILogger {
  const logDir = path.dirname(logFile);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  return winston.createLogger({
    level: "debug",
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf(
        ({ timestamp, level, message }) =>
          `${timestamp} | ${level.toUpperCase().padEnd(8)} | ${message}`,
      ),
    ),
    transports: [
      new winston.transports.File({
        filename: logFile,
        options: { encoding: "utf8" },
      }),
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: "HH:mm:ss" }),
          winston.format.printf(
            ({ timestamp, level, message }) =>
              `${timestamp} ${level} ${message}`,
          ),
        ),
      }),
    ],
  });
}
