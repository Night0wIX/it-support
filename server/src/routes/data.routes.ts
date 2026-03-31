import { Request, Response, Router } from "express";
import fs from "fs";
import type { Multer } from "multer";
import type { IDataService, ILogger } from "../types";

export function createDataRoutes(
  dataService: IDataService,
  logger: ILogger,
  upload: Multer,
): Router {
  const router = Router();

  /* POST /upload — CSV file upload */
  router.post(
    "/upload",
    upload.single("file"),
    (req: Request, res: Response) => {
      try {
        if (!req.file) {
          logger.warn("Спроба завантаження без файлу");
          res
            .status(400)
            .json({ error: "Файл не завантажено. Оберіть CSV файл." });
          return;
        }

        logger.info(`Завантаження файлу: ${req.file.originalname}`);
        const filePath = req.file.path;

        let content: string;
        try {
          content = fs.readFileSync(filePath, "utf-8");
        } catch {
          content = fs.readFileSync(filePath, "latin1");
        }

        const records = dataService.parseCSV(content);

        // Clean up temp file
        fs.unlinkSync(filePath);

        if (records.length === 0) {
          logger.warn("Завантажений файл порожній");
          res
            .status(400)
            .json({ error: "Файл порожній — немає даних для аналізу." });
          return;
        }

        dataService.setData(records, req.file.originalname);

        const columns = Object.keys(records[0]);
        const numericColumns = columns.filter((col) =>
          records.some(
            (row) => !isNaN(parseFloat(row[col])) && row[col] !== "",
          ),
        );

        logger.info(
          `Завантажено ${records.length} записів, ${columns.length} колонок`,
        );

        res.json({
          message: `Файл "${req.file.originalname}" успішно завантажено.`,
          totalRows: records.length,
          columns,
          numericColumns,
          preview: records.slice(0, 5),
        });
      } catch (err: any) {
        logger.error(`Помилка завантаження: ${err.message}`);
        res
          .status(400)
          .json({ error: `Помилка обробки файлу: ${err.message}` });
      }
    },
  );

  /* POST /generate — generate test data */
  router.post("/generate", (req: Request, res: Response) => {
    try {
      const count = Math.min(
        Math.max(parseInt(req.body.count) || 200, 10),
        2000,
      );
      logger.info(`Генерація тестових даних: ${count} записів`);

      const records = dataService.generateSampleData(count);
      dataService.setData(records, "generated_clients.csv");

      const columns = Object.keys(records[0]);
      const numericColumns = columns.filter((col) =>
        records.some((row) => !isNaN(parseFloat(row[col])) && row[col] !== ""),
      );

      res.json({
        message: `Згенеровано ${count} тестових записів клієнтів.`,
        totalRows: records.length,
        columns,
        numericColumns,
        preview: records.slice(0, 5),
      });
    } catch (err: any) {
      logger.error(`Помилка генерації: ${err.message}`);
      res
        .status(500)
        .json({ error: `Помилка генерації даних: ${err.message}` });
    }
  });

  return router;
}
