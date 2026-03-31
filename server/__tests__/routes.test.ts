import request from "supertest";
import { createApp } from "../src/app";
import type { AppConfig, ILogger } from "../src/types";

const mockLogger: ILogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

const testConfig: AppConfig = {
  app: { name: "Test App", version: "0.0.1", language: "uk" },
  server: { port: 0, host: "localhost" },
  paths: { data_dir: "data", output_dir: "output", log_file: "logs/test.log" },
  ui: {
    theme: "light",
    primaryColor: "#000",
    secondaryColor: "#fff",
    bgColor: "#eee",
  },
  clustering: {
    defaultK: 3,
    maxK: 10,
    minK: 2,
    maxIterations: 300,
    randomSeed: 42,
  },
};

function buildApp() {
  return createApp(testConfig, mockLogger);
}

describe("API Routes", () => {
  /* ── GET /api/config ── */
  describe("GET /api/config", () => {
    test("повертає 200 та конфігурацію", async () => {
      const app = buildApp();
      const res = await request(app).get("/api/config");

      expect(res.status).toBe(200);
      expect(res.body.app.name).toBe("Test App");
      expect(res.body.clustering.minK).toBe(2);
    });
  });

  /* ── POST /api/generate ── */
  describe("POST /api/generate", () => {
    test("генерує тестові дані (200 за замовчуванням)", async () => {
      const app = buildApp();
      const res = await request(app).post("/api/generate").send({});

      expect(res.status).toBe(200);
      expect(res.body.totalRows).toBe(200);
      expect(res.body.columns).toContain("client_id");
      expect(res.body.numericColumns.length).toBeGreaterThan(0);
      expect(res.body.preview).toHaveLength(5);
    });

    test("генерує вказану кількість записів", async () => {
      const app = buildApp();
      const res = await request(app).post("/api/generate").send({ count: 50 });

      expect(res.status).toBe(200);
      expect(res.body.totalRows).toBe(50);
    });

    test("обмежує мінімум 10", async () => {
      const app = buildApp();
      const res = await request(app).post("/api/generate").send({ count: 1 });
      expect(res.body.totalRows).toBe(10);
    });
  });

  /* ── POST /api/cluster ── */
  describe("POST /api/cluster", () => {
    test("повертає 400 без попередніх даних", async () => {
      const app = buildApp();
      const res = await request(app)
        .post("/api/cluster")
        .send({ featureCols: ["a", "b"], k: 2 });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("завантажте");
    });

    test("повертає 400 при < 2 ознак", async () => {
      const app = buildApp();
      await request(app).post("/api/generate").send({});

      const res = await request(app)
        .post("/api/cluster")
        .send({ featureCols: ["total_purchases"], k: 2 });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("принаймні 2");
    });

    test("повертає 400 при невалідному k", async () => {
      const app = buildApp();
      await request(app).post("/api/generate").send({});

      const res = await request(app)
        .post("/api/cluster")
        .send({ featureCols: ["total_purchases", "purchase_count"], k: 999 });

      expect(res.status).toBe(400);
    });

    test("повертає 400 при відсутніх колонках", async () => {
      const app = buildApp();
      await request(app).post("/api/generate").send({});

      const res = await request(app)
        .post("/api/cluster")
        .send({ featureCols: ["nonexistent_col", "another"], k: 2 });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Відсутні колонки");
    });

    test("успішна кластеризація", async () => {
      const app = buildApp();
      await request(app).post("/api/generate").send({ count: 50 });

      const res = await request(app)
        .post("/api/cluster")
        .send({ featureCols: ["total_purchases", "purchase_count"], k: 3 });

      expect(res.status).toBe(200);
      expect(res.body.labels).toHaveLength(50);
      expect(res.body.clusterStats).toHaveLength(3);
      expect(res.body.silhouette).toBeDefined();
      expect(res.body.labeledData).toHaveLength(50);
      expect(res.body.centroids).toHaveLength(3);
    });
  });

  /* ── POST /api/optimal-k ── */
  describe("POST /api/optimal-k", () => {
    test("повертає 400 без попередніх даних", async () => {
      const app = buildApp();
      const res = await request(app)
        .post("/api/optimal-k")
        .send({ featureCols: ["a", "b"] });

      expect(res.status).toBe(400);
    });

    test("повертає 400 при < 2 ознак", async () => {
      const app = buildApp();
      await request(app).post("/api/generate").send({});

      const res = await request(app)
        .post("/api/optimal-k")
        .send({ featureCols: ["total_purchases"] });

      expect(res.status).toBe(400);
    });

    test("повертає оптимальне k", async () => {
      const app = buildApp();
      await request(app).post("/api/generate").send({ count: 50 });

      const res = await request(app)
        .post("/api/optimal-k")
        .send({ featureCols: ["total_purchases", "purchase_count"] });

      expect(res.status).toBe(200);
      expect(res.body.bestK).toBeGreaterThanOrEqual(2);
      expect(res.body.bestK).toBeLessThanOrEqual(10);
      expect(res.body.results.length).toBeGreaterThan(0);
    });
  });

  /* ── GET /api/export ── */
  describe("GET /api/export", () => {
    test("повертає 400 без даних", async () => {
      const app = buildApp();
      const res = await request(app).get("/api/export");

      expect(res.status).toBe(400);
    });

    test("повертає CSV після генерації", async () => {
      const app = buildApp();
      await request(app).post("/api/generate").send({});

      const res = await request(app).get("/api/export");

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/csv");
      expect(res.headers["content-disposition"]).toContain(
        "clustering_results.csv",
      );
      expect(res.text).toContain("client_id");
    });
  });

  /* ── Upload (без файлу) ── */
  describe("POST /api/upload", () => {
    test("повертає 400 без файлу", async () => {
      const app = buildApp();
      const res = await request(app).post("/api/upload");

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Файл не завантажено");
    });
  });

  /* ── Full pipeline: generate → cluster → export ── */
  describe("Full pipeline", () => {
    test("generate → cluster → export", async () => {
      const app = buildApp();

      const gen = await request(app).post("/api/generate").send({ count: 30 });
      expect(gen.status).toBe(200);

      const cluster = await request(app)
        .post("/api/cluster")
        .send({
          featureCols: ["total_purchases", "purchase_count", "avg_purchase"],
          k: 2,
        });
      expect(cluster.status).toBe(200);
      expect(cluster.body.clusterStats).toHaveLength(2);

      const exp = await request(app).get("/api/export");
      expect(exp.status).toBe(200);
      expect(exp.text).toContain("clusterName");
    });
  });
});
