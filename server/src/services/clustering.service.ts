import { kmeans } from "ml-kmeans";
import type {
  ClusterStat,
  ClusteringConfig,
  ClusteringResult,
  IClusteringService,
  ILogger,
  OptimalKEntry,
  OptimalKResult,
  RawRow,
} from "../types";

const CLUSTER_NAMES = [
  "Нові клієнти",
  "Активні покупці",
  "VIP клієнти",
  "Сплячі клієнти",
  "Рідкісні покупці",
  "Потенційні VIP",
  "Втрачені клієнти",
  "Нерегулярні",
  "Економні покупці",
  "Преміум сегмент",
];

export class ClusteringService implements IClusteringService {
  constructor(
    private readonly logger: ILogger,
    private readonly cfg: ClusteringConfig,
  ) {}

  clusterize(
    data: RawRow[],
    featureCols: string[],
    k: number,
  ): ClusteringResult {
    this.logger.info(
      `Кластеризація: k=${k}, записів=${data.length}, ознаки=[${featureCols.join(", ")}]`,
    );

    const featureData = extractFeatures(data, featureCols);
    const { scaled } = standardize(featureData);

    const result = kmeans(scaled, k, {
      maxIterations: this.cfg.maxIterations,
      seed: this.cfg.randomSeed,
      initialization: "kmeans++",
    });

    const labels: number[] = result.clusters;
    const sil = silhouetteScore(scaled, labels);

    this.logger.info(`Кластеризацію завершено. Silhouette=${sil.toFixed(4)}`);

    const clusterStats = buildClusterStats(data, featureCols, labels, k);
    const labeledData = data.map((row, i) => ({
      ...row,
      cluster: labels[i],
      clusterName: CLUSTER_NAMES[labels[i]] || `Кластер ${labels[i]}`,
    }));

    return {
      labels,
      silhouette: parseFloat(sil.toFixed(4)),
      clusterStats,
      labeledData,
      centroids: result.centroids.map((c) => [...c]),
      scaledData: scaled,
    };
  }

  findOptimalK(
    data: RawRow[],
    featureCols: string[],
    minK: number,
    maxK: number,
  ): OptimalKResult {
    this.logger.info(`Пошук оптимального k: діапазон ${minK}-${maxK}`);

    const featureData = extractFeatures(data, featureCols);
    const { scaled } = standardize(featureData);

    const results: OptimalKEntry[] = [];
    let bestK = minK;
    let bestSil = -1;

    for (let k = minK; k <= maxK; k++) {
      const result = kmeans(scaled, k, {
        maxIterations: this.cfg.maxIterations,
        seed: this.cfg.randomSeed,
        initialization: "kmeans++",
      });

      const inertia = result.centroids.reduce((total, centroid, cIdx) => {
        const points = scaled.filter((_, i) => result.clusters[i] === cIdx);
        return (
          total + points.reduce((sum, p) => sum + euclidean(p, centroid), 0)
        );
      }, 0);

      const sil = silhouetteScore(scaled, result.clusters);
      results.push({
        k,
        inertia: parseFloat(inertia.toFixed(2)),
        silhouette: parseFloat(sil.toFixed(4)),
      });

      if (sil > bestSil) {
        bestSil = sil;
        bestK = k;
      }
    }

    this.logger.info(
      `Оптимальне k=${bestK} (silhouette=${bestSil.toFixed(4)})`,
    );
    return { results, bestK };
  }
}

/* ── Pure functions ─────────────────────── */

export function extractFeatures(
  data: RawRow[],
  featureCols: string[],
): number[][] {
  return data.map((row) =>
    featureCols.map((col) => {
      const val = parseFloat(row[col]);
      return isNaN(val) ? 0 : val;
    }),
  );
}

export function standardize(data: number[][]): {
  scaled: number[][];
  means: number[];
  stds: number[];
} {
  const n = data.length;
  const dim = data[0].length;
  const means = new Array<number>(dim).fill(0);
  const stds = new Array<number>(dim).fill(0);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < dim; j++) {
      means[j] += data[i][j];
    }
  }
  for (let j = 0; j < dim; j++) means[j] /= n;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < dim; j++) {
      stds[j] += (data[i][j] - means[j]) ** 2;
    }
  }
  for (let j = 0; j < dim; j++) stds[j] = Math.sqrt(stds[j] / n) || 1;

  const scaled = data.map((row) =>
    row.map((val, j) => (val - means[j]) / stds[j]),
  );
  return { scaled, means, stds };
}

export function euclidean(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

export function silhouetteScore(data: number[][], labels: number[]): number {
  const n = data.length;
  if (n < 2) return 0;

  const clusters: Record<number, number[]> = {};
  labels.forEach((label, i) => {
    if (!clusters[label]) clusters[label] = [];
    clusters[label].push(i);
  });

  const clusterKeys = Object.keys(clusters).map(Number);
  if (clusterKeys.length < 2) return 0;

  let totalScore = 0;

  for (let i = 0; i < n; i++) {
    const myCluster = labels[i];
    const myClusterIndices = clusters[myCluster].filter((idx) => idx !== i);

    let a = 0;
    if (myClusterIndices.length > 0) {
      for (const j of myClusterIndices) a += euclidean(data[i], data[j]);
      a /= myClusterIndices.length;
    }

    let b = Infinity;
    for (const key of clusterKeys) {
      if (key === myCluster) continue;
      const otherIndices = clusters[key];
      let avgDist = 0;
      for (const j of otherIndices) avgDist += euclidean(data[i], data[j]);
      avgDist /= otherIndices.length;
      if (avgDist < b) b = avgDist;
    }

    const s = a === 0 && b === 0 ? 0 : (b - a) / Math.max(a, b);
    totalScore += s;
  }

  return totalScore / n;
}

function buildClusterStats(
  data: RawRow[],
  featureCols: string[],
  labels: number[],
  k: number,
): ClusterStat[] {
  const stats: ClusterStat[] = [];

  for (let c = 0; c < k; c++) {
    const indices = labels.reduce<number[]>((acc, label, idx) => {
      if (label === c) acc.push(idx);
      return acc;
    }, []);

    const stat: ClusterStat = {
      id: c,
      name: CLUSTER_NAMES[c] || `Кластер ${c}`,
      count: indices.length,
    };

    for (const col of featureCols) {
      const vals = indices.map((i) => parseFloat(data[i][col]) || 0);
      stat[col + "_avg"] =
        vals.length > 0
          ? parseFloat(
              (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2),
            )
          : 0;
    }

    stats.push(stat);
  }

  return stats;
}
