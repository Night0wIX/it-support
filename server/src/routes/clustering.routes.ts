import { Request, Response, Router } from "express";
import type {
  ClusteringConfig,
  IClusteringService,
  IDataService,
  ILogger,
} from "../types";

export function createClusteringRoutes(
  clusteringService: IClusteringService,
  dataService: IDataService,
  logger: ILogger,
  cfg: ClusteringConfig,
): Router {
  const router = Router();

  /* POST /cluster — run K-Means */
  router.post("/cluster", (req: Request, res: Response) => {
    try {
      const data = dataService.getData();
      if (!data || data.length === 0) {
        res
          .status(400)
          .json({ error: "Спочатку завантажте або згенеруйте дані." });
        return;
      }

      const { featureCols, k } = req.body;

      if (
        !featureCols ||
        !Array.isArray(featureCols) ||
        featureCols.length < 2
      ) {
        res
          .status(400)
          .json({
            error: "Оберіть принаймні 2 числові ознаки для кластеризації.",
          });
        return;
      }

      const kVal = parseInt(k);
      if (isNaN(kVal) || kVal < cfg.minK || kVal > cfg.maxK) {
        res.status(400).json({
          error: `Кількість кластерів має бути від ${cfg.minK} до ${cfg.maxK}.`,
        });
        return;
      }

      if (data.length < kVal) {
        res.status(400).json({
          error: `Кількість записів (${data.length}) менша за кількість кластерів (${kVal}).`,
        });
        return;
      }

      const missingCols = featureCols.filter(
        (col: string) => !(col in data[0]),
      );
      if (missingCols.length > 0) {
        res.status(400).json({
          error: `Відсутні колонки у даних: ${missingCols.join(", ")}`,
        });
        return;
      }

      const result = clusteringService.clusterize(data, featureCols, kVal);
      logger.info(
        `Кластеризація завершена: k=${kVal}, silhouette=${result.silhouette}`,
      );

      // Update data store with labeled data for export
      dataService.setData(
        result.labeledData as unknown as Record<string, string>[],
        dataService.getFileName(),
      );

      res.json(result);
    } catch (err: any) {
      logger.error(`Помилка кластеризації: ${err.message}`);
      res.status(500).json({ error: `Помилка кластеризації: ${err.message}` });
    }
  });

  /* POST /optimal-k — find best k */
  router.post("/optimal-k", (req: Request, res: Response) => {
    try {
      const data = dataService.getData();
      if (!data || data.length === 0) {
        res
          .status(400)
          .json({ error: "Спочатку завантажте або згенеруйте дані." });
        return;
      }

      const { featureCols } = req.body;
      if (
        !featureCols ||
        !Array.isArray(featureCols) ||
        featureCols.length < 2
      ) {
        res.status(400).json({ error: "Оберіть принаймні 2 числові ознаки." });
        return;
      }

      const result = clusteringService.findOptimalK(
        data,
        featureCols,
        cfg.minK,
        cfg.maxK,
      );
      res.json(result);
    } catch (err: any) {
      logger.error(`Помилка пошуку оптимального k: ${err.message}`);
      res.status(500).json({ error: `Помилка: ${err.message}` });
    }
  });

  return router;
}
