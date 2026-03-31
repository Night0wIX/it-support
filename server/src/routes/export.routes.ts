import { Request, Response, Router } from "express";
import type { IDataService, IExportService, ILogger } from "../types";

export function createExportRoutes(
  dataService: IDataService,
  exportService: IExportService,
  logger: ILogger,
): Router {
  const router = Router();

  router.get("/export", (_req: Request, res: Response) => {
    try {
      const data = dataService.getData();
      if (!data || data.length === 0) {
        res.status(400).json({ error: "Немає даних для експорту." });
        return;
      }

      const csv = exportService.toCSV(data);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="clustering_results.csv"',
      );
      res.send(csv);

      logger.info("Результати експортовано у CSV");
    } catch (err: any) {
      logger.error(`Помилка експорту: ${err.message}`);
      res.status(500).json({ error: `Помилка експорту: ${err.message}` });
    }
  });

  return router;
}
