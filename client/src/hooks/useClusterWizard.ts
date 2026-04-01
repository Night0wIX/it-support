import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchConfig,
  findOptimalK,
  generateData,
  runClustering,
  uploadFile,
} from "../api";
import type {
  AnimDir,
  AppConfig,
  ClusterResult,
  OptimalKResult,
  Step,
  UploadResponse,
} from "../types";

export interface WizardState {
  config: AppConfig | null;
  step: Step;
  animDir: AnimDir;
  dataInfo: UploadResponse | null;
  selectedFeatures: string[];
  k: number;
  clusterResult: ClusterResult | null;
  optimalKResult: OptimalKResult | null;
  loading: string;
  error: string;
  success: string;
  dragOver: boolean;
  fileRef: React.RefObject<HTMLInputElement | null>;
  maxReached: Step;
}

export interface WizardActions {
  goTo: (target: Step) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleGenerate: () => Promise<void>;
  handleCluster: () => Promise<void>;
  handleFindOptimalK: () => Promise<void>;
  toggleFeature: (col: string) => void;
  setK: (k: number) => void;
  setDragOver: (v: boolean) => void;
  setError: (msg: string) => void;
  setSuccess: (msg: string) => void;
  resetAnalysis: () => void;
}

export function useClusterWizard(): WizardState & WizardActions {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [animDir, setAnimDir] = useState<AnimDir>("next");

  const [dataInfo, setDataInfo] = useState<UploadResponse | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [k, setK] = useState(3);
  const [clusterResult, setClusterResult] = useState<ClusterResult | null>(
    null,
  );
  const [optimalKResult, setOptimalKResult] = useState<OptimalKResult | null>(
    null,
  );
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConfig()
      .then((cfg) => {
        setConfig(cfg);
        setK(cfg.clustering.defaultK);
      })
      .catch(() => setError("Не вдалося завантажити конфігурацію."));
  }, []);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const goTo = useCallback(
    (target: Step) => {
      setAnimDir(target > step ? "next" : "prev");
      setStep(target);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [step],
  );

  const processFile = useCallback(async (file: File) => {
    clearMessages();
    setClusterResult(null);
    setOptimalKResult(null);
    setLoading("Завантаження файлу...");
    try {
      const res = await uploadFile(file);
      setDataInfo(res);
      setSelectedFeatures(res.numericColumns.slice(0, 3));
      setSuccess(res.message);
    } catch (err: any) {
      setError(err.response?.data?.error || "Помилка завантаження.");
    } finally {
      setLoading("");
    }
  }, []);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.name.endsWith(".csv")) processFile(file);
      else setError("Підтримуються лише CSV файли.");
    },
    [processFile],
  );

  const handleGenerate = useCallback(async () => {
    clearMessages();
    setClusterResult(null);
    setOptimalKResult(null);
    setLoading("Генерація тестових даних...");
    try {
      const res = await generateData(200);
      setDataInfo(res);
      setSelectedFeatures(res.numericColumns.slice(0, 3));
      setSuccess(res.message);
    } catch (err: any) {
      setError(err.response?.data?.error || "Помилка генерації.");
    } finally {
      setLoading("");
    }
  }, []);

  const toggleFeature = useCallback((col: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col],
    );
  }, []);

  const validateFeatureData = useCallback((): string | null => {
    if (!dataInfo?.preview) return null;
    const badCols: string[] = [];
    for (const col of selectedFeatures) {
      const invalid = dataInfo.preview.filter(
        (row) => row[col] === "" || isNaN(parseFloat(row[col])),
      ).length;
      if (invalid > 0) badCols.push(col);
    }
    if (badCols.length > 0) {
      return `Колонки містять нечислові дані: ${badCols.join(", ")}. Оберіть інші ознаки або завантажте коректний CSV.`;
    }
    return null;
  }, [dataInfo, selectedFeatures]);

  const handleCluster = useCallback(async () => {
    if (selectedFeatures.length < 2) {
      setError("Оберіть принаймні 2 ознаки.");
      return;
    }
    const validationError = validateFeatureData();
    if (validationError) {
      setError(validationError);
      return;
    }
    clearMessages();
    setLoading("Кластеризація...");
    try {
      const res = await runClustering(selectedFeatures, k);
      setClusterResult(res);
      setSuccess(`Silhouette score: ${res.silhouette}`);
      setAnimDir("next");
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err.response?.data?.error || "Помилка кластеризації.");
    } finally {
      setLoading("");
    }
  }, [selectedFeatures, k, validateFeatureData]);

  const handleFindOptimalK = useCallback(async () => {
    if (selectedFeatures.length < 2) {
      setError("Оберіть принаймні 2 ознаки.");
      return;
    }
    const validationError = validateFeatureData();
    if (validationError) {
      setError(validationError);
      return;
    }
    clearMessages();
    setLoading("Аналіз оптимального k...");
    try {
      const res = await findOptimalK(selectedFeatures);
      setOptimalKResult(res);
      setK(res.bestK);
      setSuccess(`Рекомендовано k = ${res.bestK}`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Помилка аналізу.");
    } finally {
      setLoading("");
    }
  }, [selectedFeatures]);

  const resetAnalysis = useCallback(() => {
    setClusterResult(null);
    setOptimalKResult(null);
    goTo(1);
  }, [goTo]);

  const maxReached: Step = !dataInfo ? 1 : !clusterResult ? 2 : 3;

  return {
    config,
    step,
    animDir,
    dataInfo,
    selectedFeatures,
    k,
    clusterResult,
    optimalKResult,
    loading,
    error,
    success,
    dragOver,
    fileRef,
    maxReached,
    goTo,
    handleFileUpload,
    handleDrop,
    handleGenerate,
    handleCluster,
    handleFindOptimalK,
    toggleFeature,
    setK,
    setDragOver,
    setError,
    setSuccess,
    resetAnalysis,
  };
}
