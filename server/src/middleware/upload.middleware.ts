import multer from "multer";
import path from "path";

export function createUploadMiddleware(destDir: string) {
  return multer({
    dest: destDir,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (file.mimetype === "text/csv" || ext === ".csv") {
        cb(null, true);
      } else {
        cb(new Error("Дозволені лише CSV файли."));
      }
    },
  });
}
