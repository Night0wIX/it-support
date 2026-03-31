import { cn } from "../../utils/cn";
import s from "./Toasts.module.css";

interface ToastsProps {
  error: string;
  success: string;
  loading: string;
  onClearError: () => void;
  onClearSuccess: () => void;
}

export function Toasts({
  error,
  success,
  loading,
  onClearError,
  onClearSuccess,
}: ToastsProps) {
  if (!error && !success && !loading) return null;

  return (
    <div className={s.toasts}>
      {error && (
        <div className={cn(s.toast, s["toast--error"])}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>{error}</span>
          <button className={s.toast__close} onClick={onClearError}>
            &times;
          </button>
        </div>
      )}
      {success && (
        <div className={cn(s.toast, s["toast--success"])}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{success}</span>
          <button className={s.toast__close} onClick={onClearSuccess}>
            &times;
          </button>
        </div>
      )}
      {loading && (
        <div className={cn(s.toast, s["toast--info"])}>
          <span className={s.toast__spinner} />
          <span>{loading}</span>
        </div>
      )}
    </div>
  );
}
