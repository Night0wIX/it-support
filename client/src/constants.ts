import type { Step } from "./types";

export const CLUSTER_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#ec4899",
  "#14b8a6",
  "#84cc16",
] as const;

export const STEPPER_ITEMS: { n: Step; label: string; icon: string }[] = [
  {
    n: 1,
    label: "Дані",
    icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
  },
  { n: 2, label: "Параметри", icon: "M12 20V10M18 20V4M6 20v-4" },
  { n: 3, label: "Результати", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
];
