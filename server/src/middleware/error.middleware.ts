import type { NextFunction, Request, Response } from "express";
import type { ILogger } from "../types";

export function createErrorMiddleware(logger: ILogger) {
  return (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(`Необроблена помилка: ${err.message}`);
    res
      .status(500)
      .json({ error: "Внутрішня помилка сервера. Спробуйте пізніше." });
  };
}
