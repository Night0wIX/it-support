/* ───────────────────────────────────────────
   Domain types for CRM Clustering backend
   ─────────────────────────────────────────── */

/** Raw CSV row — all values are strings after parsing. */
export type RawRow = Record<string, string>;

/** Labeled data row after clustering. */
export type LabeledRow = Record<string, string | number>;

/* ── Config ── */

export interface ClusteringConfig {
  defaultK: number;
  maxK: number;
  minK: number;
  maxIterations: number;
  randomSeed: number;
}

export interface AppConfig {
  app: { name: string; version: string; language: string };
  server: { port: number; host: string };
  paths: { data_dir: string; output_dir: string; log_file: string };
  ui: {
    theme: string;
    primaryColor: string;
    secondaryColor: string;
    bgColor: string;
  };
  clustering: ClusteringConfig;
}

/* ── Clustering results ── */

export interface ClusterStat {
  id: number;
  name: string;
  count: number;
  [key: string]: string | number;
}

export interface ClusteringResult {
  labels: number[];
  silhouette: number;
  clusterStats: ClusterStat[];
  labeledData: LabeledRow[];
  centroids: number[][];
  scaledData: number[][];
}

export interface OptimalKEntry {
  k: number;
  inertia: number;
  silhouette: number;
}

export interface OptimalKResult {
  results: OptimalKEntry[];
  bestK: number;
}

/* ── Upload response ── */

export interface UploadResult {
  message: string;
  totalRows: number;
  columns: string[];
  numericColumns: string[];
  preview: RawRow[];
}

/* ── Service interfaces (DIP) ── */

export interface IDataService {
  getData(): RawRow[] | null;
  setData(rows: RawRow[], fileName: string): void;
  getFileName(): string;
  getNumericColumns(): string[];
  getColumns(): string[];
  parseCSV(content: string): RawRow[];
  generateSampleData(count: number): RawRow[];
}

export interface IClusteringService {
  clusterize(
    data: RawRow[],
    featureCols: string[],
    k: number,
  ): ClusteringResult;
  findOptimalK(
    data: RawRow[],
    featureCols: string[],
    minK: number,
    maxK: number,
  ): OptimalKResult;
}

export interface IExportService {
  toCSV(data: RawRow[] | LabeledRow[]): string;
}

export interface ILogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  debug(message: string): void;
}
