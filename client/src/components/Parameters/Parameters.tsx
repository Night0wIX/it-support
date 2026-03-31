import type { AppConfig, OptimalKResult, UploadResponse } from "../../types";
import { cn } from "../../utils/cn";
import s from "./Parameters.module.css";

interface ParametersProps {
  config: AppConfig | null;
  dataInfo: UploadResponse;
  selectedFeatures: string[];
  k: number;
  loading: string;
  optimalKResult: OptimalKResult | null;
  onToggleFeature: (col: string) => void;
  onSetK: (k: number) => void;
  onCluster: () => void;
  onFindOptimalK: () => void;
  onBack: () => void;
  animClass: string;
}

export function Parameters({
  config,
  dataInfo,
  selectedFeatures,
  k,
  loading,
  optimalKResult,
  onToggleFeature,
  onSetK,
  onCluster,
  onFindOptimalK,
  onBack,
  animClass,
}: ParametersProps) {
  const disabled = !!loading || selectedFeatures.length < 2;

  return (
    <div className={cn(s.params, animClass)}>
      {/* Main card */}
      <div className={s.params__card}>
        <div className={s.params__header}>
          <div className={cn(s.params__icon, s["params__icon--amber"])}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <div>
            <h2 className={s.params__title}>Параметри кластеризації</h2>
            <p className={s.params__subtitle}>
              Оберіть ознаки та кількість кластерів
            </p>
          </div>
        </div>

        {/* Features */}
        <section className={s.params__section}>
          <div className={s.params__sectionHead}>
            <h3 className={s.params__sectionTitle}>Ознаки</h3>
            <span className={s.params__counter}>
              {selectedFeatures.length} / {dataInfo.numericColumns.length}
            </span>
          </div>
          <p className={s.params__hint}>Мінімум 2 числові ознаки</p>
          <div className={s.params__chips}>
            {dataInfo.numericColumns.map((col) => (
              <button
                key={col}
                className={cn(
                  s.params__chip,
                  selectedFeatures.includes(col) && s["params__chip--active"],
                )}
                onClick={() => onToggleFeature(col)}
              >
                <span className={s.params__chipDot} />
                {col}
              </button>
            ))}
          </div>
        </section>

        {/* K slider */}
        <section className={s.params__section}>
          <div className={s.params__sectionHead}>
            <h3 className={s.params__sectionTitle}>Кількість кластерів (k)</h3>
            <div className={s.params__kBadge}>{k}</div>
          </div>
          <div className={s.params__range}>
            <input
              type="range"
              min={config?.clustering.minK || 2}
              max={config?.clustering.maxK || 10}
              value={k}
              onChange={(e) => onSetK(parseInt(e.target.value))}
            />
            <div className={s.params__rangeEnds}>
              <span>{config?.clustering.minK || 2}</span>
              <span>{config?.clustering.maxK || 10}</span>
            </div>
          </div>
        </section>

        {/* Action buttons */}
        <div className={s.params__actions}>
          <button
            className={s.params__btnPrimary}
            onClick={onCluster}
            disabled={disabled}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Кластеризувати
          </button>
          <button
            className={s.params__btnOutline}
            onClick={onFindOptimalK}
            disabled={disabled}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Знайти оптимальне k
          </button>
        </div>
      </div>

      {/* Optimal K results */}
      {optimalKResult && (
        <div className={s.params__card}>
          <div className={s.params__header}>
            <div className={cn(s.params__icon, s["params__icon--purple"])}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div>
              <h2 className={s.params__title}>Аналіз оптимального k</h2>
              <p className={s.params__subtitle}>
                Порівняння якості кластеризації
              </p>
            </div>
          </div>
          <div className={s.params__table}>
            <table>
              <thead>
                <tr>
                  <th>k</th>
                  <th>Inertia</th>
                  <th>Silhouette</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {optimalKResult.results.map((r) => (
                  <tr
                    key={r.k}
                    className={
                      r.k === optimalKResult.bestK
                        ? s.params__bestRow
                        : undefined
                    }
                  >
                    <td>
                      <strong>{r.k}</strong>
                    </td>
                    <td>{r.inertia}</td>
                    <td>{r.silhouette}</td>
                    <td>
                      {r.k === optimalKResult.bestK && (
                        <span className={s.params__bestTag}>Найкраще</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className={s.params__nav}>
        <button className={s.params__btnGhost} onClick={onBack}>
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
          Назад
        </button>
        <button
          className={s.params__btnPrimary}
          onClick={onCluster}
          disabled={disabled}
        >
          Запустити
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
