import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 30000,
});

export interface UploadResponse {
  message: string;
  totalRows: number;
  columns: string[];
  numericColumns: string[];
  preview: Record<string, string>[];
}

export interface ClusterResult {
  labels: number[];
  silhouette: number;
  clusterStats: ClusterStat[];
  labeledData: Record<string, string | number>[];
  centroids: number[][];
  scaledData: number[][];
}

export interface ClusterStat {
  id: number;
  name: string;
  count: number;
  [key: string]: string | number;
}

export interface OptimalKResult {
  results: { k: number; inertia: number; silhouette: number }[];
  bestK: number;
}

export interface AppConfig {
  app: { name: string; version: string; language: string };
  ui: {
    theme: string;
    primaryColor: string;
    secondaryColor: string;
    bgColor: string;
  };
  clustering: { defaultK: number; maxK: number; minK: number };
}

export async function fetchConfig(): Promise<AppConfig> {
  const res = await api.get<AppConfig>("/config");
  return res.data;
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post<UploadResponse>("/upload", form);
  return res.data;
}

export async function generateData(count: number): Promise<UploadResponse> {
  const res = await api.post<UploadResponse>("/generate", { count });
  return res.data;
}

export async function runClustering(
  featureCols: string[],
  k: number,
): Promise<ClusterResult> {
  const res = await api.post<ClusterResult>("/cluster", { featureCols, k });
  return res.data;
}

export async function findOptimalK(
  featureCols: string[],
): Promise<OptimalKResult> {
  const res = await api.post<OptimalKResult>("/optimal-k", { featureCols });
  return res.data;
}

export function getExportUrl(): string {
  return "/api/export";
}
