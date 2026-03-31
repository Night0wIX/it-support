import type { UploadResponse } from "../../types";
import { cn } from "../../utils/cn";
import s from "./DataUpload.module.css";

interface DataUploadProps {
  dataInfo: UploadResponse | null;
  loading: string;
  dragOver: boolean;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: () => void;
  onDragLeave: () => void;
  onGenerate: () => void;
  onNext: () => void;
  animClass: string;
}

export function DataUpload({
  dataInfo,
  loading,
  dragOver,
  fileRef,
  onFileUpload,
  onDrop,
  onDragOver,
  onDragLeave,
  onGenerate,
  onNext,
  animClass,
}: DataUploadProps) {
  return (
    <div className={cn(s.upload, animClass)}>
      <div className={s.upload__card}>
        {/* Header */}
        <div className={s.upload__header}>
          <div className={s.upload__icon}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div>
            <h2 className={s.upload__title}>Завантаження даних</h2>
            <p className={s.upload__subtitle}>
              Почніть з CSV-файлу або тестового набору
            </p>
          </div>
        </div>

        {/* Drop zone */}
        <div
          className={cn(
            s.upload__drop,
            dragOver && s["upload__drop--hovering"],
            !!dataInfo && s["upload__drop--uploaded"],
          )}
          onDragOver={(e) => {
            e.preventDefault();
            onDragOver();
          }}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !dataInfo && fileRef.current?.click()}
        >
          <input
            ref={fileRef as React.RefObject<HTMLInputElement>}
            type="file"
            accept=".csv"
            onChange={onFileUpload}
            hidden
          />

          {dataInfo ? (
            <div className={s.upload__ok}>
              <div className={s.upload__okRing}>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <span className={s.upload__okLabel}>Дані завантажено</span>
                <span className={s.upload__okMeta}>
                  {dataInfo.totalRows} записів ·{" "}
                  {dataInfo.numericColumns.length} ознак
                </span>
              </div>
              <button
                className={s.upload__replace}
                onClick={(e) => {
                  e.stopPropagation();
                  fileRef.current?.click();
                }}
              >
                Замінити
              </button>
            </div>
          ) : (
            <div className={s.upload__empty}>
              <div className={s.upload__dropIcon}>
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p>
                <strong>Перетягніть CSV сюди</strong>
              </p>
              <p className={s.upload__dropHint}>або натисніть для вибору</p>
              <div className={s.upload__formats}>
                <span className={s.upload__fmt}>.csv</span>
                <span className={s.upload__fmt}>UTF-8</span>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className={s.upload__divider}>
          <span>або</span>
        </div>

        {/* Generate */}
        <button
          className={s.upload__generate}
          onClick={onGenerate}
          disabled={!!loading}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
          Згенерувати тестові дані
          <span className={s.upload__pill}>200</span>
        </button>

        {/* Preview */}
        {dataInfo && (
          <div className={s.upload__preview}>
            <div className={s.upload__kpis}>
              <div className={s.upload__kpi}>
                <b className={s.upload__kpiValue}>{dataInfo.totalRows}</b>
                <span className={s.upload__kpiLabel}>записів</span>
              </div>
              <div className={s.upload__kpiSep} />
              <div className={s.upload__kpi}>
                <b className={s.upload__kpiValue}>{dataInfo.columns.length}</b>
                <span className={s.upload__kpiLabel}>колонок</span>
              </div>
              <div className={s.upload__kpiSep} />
              <div className={s.upload__kpi}>
                <b className={s.upload__kpiValue}>
                  {dataInfo.numericColumns.length}
                </b>
                <span className={s.upload__kpiLabel}>числових</span>
              </div>
            </div>

            {dataInfo.preview.length > 0 && (
              <div className={s.upload__table}>
                <table>
                  <thead>
                    <tr>
                      {dataInfo.columns.map((c) => (
                        <th key={c}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataInfo.preview.slice(0, 4).map((row, i) => (
                      <tr key={i}>
                        {dataInfo.columns.map((c) => (
                          <td key={c}>{row[c]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className={s.upload__nav}>
        <div />
        <button
          className={s.upload__next}
          onClick={onNext}
          disabled={!dataInfo}
        >
          Далі
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
