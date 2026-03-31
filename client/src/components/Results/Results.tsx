import { getExportUrl } from "../../api";
import { CLUSTER_COLORS } from "../../constants";
import type { ClusterResult, OptimalKResult } from "../../types";
import { cn } from "../../utils/cn";
import { ClusterCharts } from "../ClusterCharts/ClusterCharts";
import s from "./Results.module.css";

interface ResultsProps {
  clusterResult: ClusterResult;
  optimalKResult: OptimalKResult | null;
  selectedFeatures: string[];
  onBackToParams: () => void;
  onReset: () => void;
  animClass: string;
}

export function Results({
  clusterResult,
  optimalKResult,
  selectedFeatures,
  onBackToParams,
  onReset,
  animClass,
}: ResultsProps) {
  return (
    <div className={cn(s.results, animClass)}>
      {/* KPI cards */}
      <div className={s.results__kpis}>
        <div className={cn(s.results__kpi, s["results__kpi--purple"])}>
          <span className={s.results__kpiNum}>
            {clusterResult.clusterStats.length}
          </span>
          <span className={s.results__kpiLabel}>Кластерів</span>
        </div>
        <div className={cn(s.results__kpi, s["results__kpi--green"])}>
          <span className={s.results__kpiNum}>{clusterResult.silhouette}</span>
          <span className={s.results__kpiLabel}>Silhouette</span>
        </div>
        <div className={cn(s.results__kpi, s["results__kpi--blue"])}>
          <span className={s.results__kpiNum}>
            {clusterResult.labeledData.length}
          </span>
          <span className={s.results__kpiLabel}>Записів</span>
        </div>
      </div>

      {/* Cluster profiles */}
      <div className={s.results__card}>
        <div className={s.results__header}>
          <div className={cn(s.results__icon, s["results__icon--green"])}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <h2 className={s.results__title}>Профілі кластерів</h2>
            <p className={s.results__subtitle}>
              Середні значення ознак по сегментах
            </p>
          </div>
        </div>
        <div className={s.results__profiles}>
          {clusterResult.clusterStats.map((stat) => (
            <div
              key={stat.id}
              className={s.results__profile}
              style={
                {
                  "--accent": CLUSTER_COLORS[stat.id % CLUSTER_COLORS.length],
                } as React.CSSProperties
              }
            >
              <div className={s.results__profileHead}>
                <span
                  className={s.results__badge}
                  style={{
                    backgroundColor:
                      CLUSTER_COLORS[stat.id % CLUSTER_COLORS.length],
                  }}
                >
                  {stat.name}
                </span>
                <span className={s.results__profileCount}>
                  {stat.count} клієнтів
                </span>
              </div>
              <div className={s.results__metrics}>
                {selectedFeatures.map((f) => (
                  <div key={f} className={s.results__metric}>
                    <span className={s.results__metricLabel}>{f}</span>
                    <span className={s.results__metricVal}>
                      {stat[f + "_avg"]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className={s.results__card}>
        <div className={s.results__header}>
          <div className={cn(s.results__icon, s["results__icon--blue"])}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <div>
            <h2 className={s.results__title}>Візуалізація</h2>
            <p className={s.results__subtitle}>
              Графіки розподілу та аналітика
            </p>
          </div>
        </div>
        <ClusterCharts
          clusterResult={clusterResult}
          features={selectedFeatures}
          colors={[...CLUSTER_COLORS]}
          optimalKResult={optimalKResult}
        />
      </div>

      {/* Data table */}
      <div className={s.results__card}>
        <div className={s.results__header}>
          <div className={cn(s.results__icon, s["results__icon--amber"])}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </div>
          <div>
            <h2 className={s.results__title}>Таблиця результатів</h2>
            <p className={s.results__subtitle}>Дані з присвоєними сегментами</p>
          </div>
        </div>

        <div className={s.results__export}>
          <a href={getExportUrl()} className={s.results__exportBtn} download>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Завантажити CSV
          </a>
          <span className={s.results__exportMeta}>
            {clusterResult.labeledData.length} записів
          </span>
        </div>

        <div className={s.results__table}>
          <table>
            <thead>
              <tr>
                {Object.keys(clusterResult.labeledData[0] || {})
                  .filter((k) => k !== "cluster")
                  .map((col) => (
                    <th key={col}>{col}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {clusterResult.labeledData.slice(0, 50).map((row, i) => (
                <tr key={i}>
                  {Object.entries(row)
                    .filter(([k]) => k !== "cluster")
                    .map(([key, val]) => (
                      <td key={key}>
                        {key === "clusterName" ? (
                          <span
                            className={s.results__badge}
                            style={{
                              backgroundColor:
                                CLUSTER_COLORS[
                                  (row.cluster as number) %
                                    CLUSTER_COLORS.length
                                ],
                            }}
                          >
                            {String(val)}
                          </span>
                        ) : (
                          String(val)
                        )}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {clusterResult.labeledData.length > 50 && (
          <p className={s.results__tableNote}>
            Показано 50 із {clusterResult.labeledData.length}
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className={s.results__nav}>
        <button className={s.results__btnGhost} onClick={onBackToParams}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Параметри
        </button>
        <button className={s.results__btnOutline} onClick={onReset}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Новий аналіз
        </button>
      </div>
    </div>
  );
}
