import { Request, Response, Router } from "express";
import type { AppConfig } from "../types";

export function createConfigRoutes(cfg: AppConfig): Router {
  const router = Router();

  router.get("/", (_req: Request, res: Response) => {
    res.json(cfg);
  });

  return router;
}
