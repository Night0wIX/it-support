import {
  ClusteringService,
  euclidean,
  extractFeatures,
  silhouetteScore,
  standardize,
} from "../src/services/clustering.service";
import type { ClusteringConfig, ILogger, RawRow } from "../src/types";

/* ── Mock logger ── */
const mockLogger: ILogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

const defaultCfg: ClusteringConfig = {
  defaultK: 3,
  minK: 2,
  maxK: 10,
  maxIterations: 300,
  randomSeed: 42,
};

/* ══════════════════════════════════════════════════
   Pure functions
   ══════════════════════════════════════════════════ */

describe("standardize", () => {
  test("повертає масштабовані дані з середнім ~0", () => {
    const data = [
      [1, 2],
      [3, 4],
      [5, 6],
    ];
    const { scaled, means, stds } = standardize(data);

    expect(scaled).toHaveLength(3);
    expect(means[0]).toBeCloseTo(3, 5);
    expect(means[1]).toBeCloseTo(4, 5);

    const avgCol0 = scaled.reduce((s, r) => s + r[0], 0) / 3;
    expect(avgCol0).toBeCloseTo(0, 5);
    expect(stds[0]).toBeGreaterThan(0);
  });

  test("обробляє однакові значення (std=0 → 1)", () => {
    const data = [
      [5, 5],
      [5, 5],
      [5, 5],
    ];
    const { scaled, stds } = standardize(data);
    expect(scaled[0][0]).toBe(0);
    expect(stds[0]).toBe(1);
  });

  test("повертає правильну кількість стовпців", () => {
    const data = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    const { scaled, means, stds } = standardize(data);
    expect(means).toHaveLength(3);
    expect(stds).toHaveLength(3);
    expect(scaled[0]).toHaveLength(3);
  });
});

describe("euclidean", () => {
  test("повертає 0 для однакових точок", () => {
    expect(euclidean([1, 2, 3], [1, 2, 3])).toBe(0);
  });

  test("обчислює правильну евклідову відстань", () => {
    expect(euclidean([0, 0], [3, 4])).toBeCloseTo(5, 10);
  });

  test("працює для одновимірних даних", () => {
    expect(euclidean([5], [2])).toBeCloseTo(3, 10);
  });
});

describe("extractFeatures", () => {
  test("витягує числові значення з рядків", () => {
    const rows: RawRow[] = [
      { a: "1.5", b: "2", c: "text" },
      { a: "3", b: "4", c: "more" },
    ];
    const result = extractFeatures(rows, ["a", "b"]);
    expect(result).toEqual([
      [1.5, 2],
      [3, 4],
    ]);
  });

  test("замінює NaN на 0", () => {
    const rows: RawRow[] = [{ a: "abc", b: "2" }];
    const result = extractFeatures(rows, ["a", "b"]);
    expect(result).toEqual([[0, 2]]);
  });

  test("повертає порожній масив для порожніх даних", () => {
    const result = extractFeatures([], ["a", "b"]);
    expect(result).toEqual([]);
  });
});

describe("silhouetteScore", () => {
  test("повертає значення у діапазоні [-1, 1]", () => {
    const data = [
      [0, 0],
      [1, 1],
      [10, 10],
      [11, 11],
    ];
    const labels = [0, 0, 1, 1];
    const score = silhouetteScore(data, labels);
    expect(score).toBeGreaterThanOrEqual(-1);
    expect(score).toBeLessThanOrEqual(1);
  });

  test("повертає 0 для одного кластера", () => {
    const data = [
      [0, 0],
      [1, 1],
    ];
    const labels = [0, 0];
    expect(silhouetteScore(data, labels)).toBe(0);
  });

  test("повертає 0 для менш ніж 2 точок", () => {
    expect(silhouetteScore([[0, 0]], [0])).toBe(0);
  });

  test("добре розділені кластери мають високий score", () => {
    const data = [
      [0, 0],
      [0.1, 0.1],
      [100, 100],
      [100.1, 100.1],
    ];
    const labels = [0, 0, 1, 1];
    const score = silhouetteScore(data, labels);
    expect(score).toBeGreaterThan(0.9);
  });
});

/* ══════════════════════════════════════════════════
   ClusteringService
   ══════════════════════════════════════════════════ */

describe("ClusteringService", () => {
  let service: ClusteringService;

  const sampleData: RawRow[] = [];
  for (let i = 0; i < 30; i++) {
    sampleData.push({
      total_purchases: String(
        i < 15 ? 100 + Math.random() * 50 : 1000 + Math.random() * 50,
      ),
      purchase_count: String(i < 15 ? 2 + Math.random() : 20 + Math.random()),
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ClusteringService(mockLogger, defaultCfg);
  });

  describe("clusterize", () => {
    test("розділяє дані на задану кількість кластерів", () => {
      const result = service.clusterize(
        sampleData,
        ["total_purchases", "purchase_count"],
        2,
      );

      expect(result.labels).toHaveLength(30);
      expect(new Set(result.labels).size).toBe(2);
      expect(result.silhouette).toBeGreaterThan(0);
      expect(result.clusterStats).toHaveLength(2);
      expect(result.labeledData).toHaveLength(30);
    });

    test("clusterStats містять середні значення ознак", () => {
      const result = service.clusterize(
        sampleData,
        ["total_purchases", "purchase_count"],
        2,
      );

      for (const stat of result.clusterStats) {
        expect(stat).toHaveProperty("id");
        expect(stat).toHaveProperty("name");
        expect(stat).toHaveProperty("count");
        expect(stat).toHaveProperty("total_purchases_avg");
        expect(stat).toHaveProperty("purchase_count_avg");
        expect(stat.count).toBeGreaterThan(0);
      }
    });

    test("labeledData містить cluster та clusterName", () => {
      const result = service.clusterize(
        sampleData,
        ["total_purchases", "purchase_count"],
        2,
      );

      for (const row of result.labeledData) {
        expect(row).toHaveProperty("cluster");
        expect(row).toHaveProperty("clusterName");
        expect(typeof row.cluster).toBe("number");
        expect(typeof row.clusterName).toBe("string");
      }
    });

    test("centroids мають правильну розмірність", () => {
      const result = service.clusterize(
        sampleData,
        ["total_purchases", "purchase_count"],
        3,
      );
      expect(result.centroids).toHaveLength(3);
      for (const c of result.centroids) {
        expect(c).toHaveLength(2);
      }
    });

    test("кидає помилку при k > кількості записів", () => {
      const tinyData: RawRow[] = [
        { total_purchases: "100", purchase_count: "5" },
      ];
      expect(() =>
        service.clusterize(tinyData, ["total_purchases", "purchase_count"], 3),
      ).toThrow();
    });

    test("логує інформацію", () => {
      service.clusterize(sampleData, ["total_purchases", "purchase_count"], 2);
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe("findOptimalK", () => {
    const data: RawRow[] = [];
    for (let i = 0; i < 50; i++) {
      data.push({
        a: String(i < 25 ? Math.random() * 10 : 50 + Math.random() * 10),
        b: String(i < 25 ? Math.random() * 10 : 50 + Math.random() * 10),
      });
    }

    test("повертає оптимальне k та масив результатів", () => {
      const result = service.findOptimalK(data, ["a", "b"], 2, 5);

      expect(result.bestK).toBeGreaterThanOrEqual(2);
      expect(result.bestK).toBeLessThanOrEqual(5);
      expect(result.results).toHaveLength(4); // k = 2,3,4,5
    });

    test("results містять k, inertia, silhouette", () => {
      const result = service.findOptimalK(data, ["a", "b"], 2, 4);

      for (const r of result.results) {
        expect(r).toHaveProperty("k");
        expect(r).toHaveProperty("inertia");
        expect(r).toHaveProperty("silhouette");
        expect(r.inertia).toBeGreaterThanOrEqual(0);
        expect(r.silhouette).toBeGreaterThanOrEqual(-1);
        expect(r.silhouette).toBeLessThanOrEqual(1);
      }
    });

    test("bestK відповідає найвищому silhouette", () => {
      const result = service.findOptimalK(data, ["a", "b"], 2, 5);
      const best = result.results.find((r) => r.k === result.bestK)!;
      for (const r of result.results) {
        expect(best.silhouette).toBeGreaterThanOrEqual(r.silhouette);
      }
    });
  });
});
