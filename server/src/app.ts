import cors from "cors";
import express from "express";
import path from "path";
import { createErrorMiddleware } from "./middleware/error.middleware";
import { createUploadMiddleware } from "./middleware/upload.middleware";
import { createClusteringRoutes } from "./routes/clustering.routes";
import { createConfigRoutes } from "./routes/config.routes";
import { createDataRoutes } from "./routes/data.routes";
import { createExportRoutes } from "./routes/export.routes";
import { ClusteringService } from "./services/clustering.service";
import { DataService } from "./services/data.service";
import { ExportService } from "./services/export.service";
import type { AppConfig, ILogger } from "./types";

export function createApp(cfg: AppConfig, logger: ILogger) {
  const app = express();

  /* ── Middleware ── */
  app.use(cors());
  app.use(express.json());

  /* ── Services (Composition Root) ── */
  const dataService = new DataService();
  const clusteringService = new ClusteringService(logger, cfg.clustering);
  const exportService = new ExportService();

  const uploadsDir = path.resolve(__dirname, "../../uploads/");
  const upload = createUploadMiddleware(uploadsDir);

  /* ── Routes ── */
  app.use("/api/config", createConfigRoutes(cfg));
  app.use("/api", createDataRoutes(dataService, logger, upload));
  app.use(
    "/api",
    createClusteringRoutes(
      clusteringService,
      dataService,
      logger,
      cfg.clustering,
    ),
  );
  app.use("/api", createExportRoutes(dataService, exportService, logger));

  /* ── Error handling ── */
  app.use(createErrorMiddleware(logger));

  return app;
}
