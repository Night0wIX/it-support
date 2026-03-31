import { STEPPER_ITEMS } from "../../constants";
import type { Step } from "../../types";
import { cn } from "../../utils/cn";
import s from "./Stepper.module.css";

interface StepperProps {
  current: Step;
  maxReached: Step;
  onNavigate: (step: Step) => void;
}

export function Stepper({ current, maxReached, onNavigate }: StepperProps) {
  return (
    <nav className={s.stepper}>
      {STEPPER_ITEMS.map((item, i) => (
        <div key={item.n} className={s.stepper__segment}>
          <button
            className={cn(
              s.stepper__dot,
              current === item.n && s["stepper__dot--current"],
              maxReached > item.n && s["stepper__dot--done"],
            )}
            onClick={() => maxReached >= item.n && onNavigate(item.n)}
            disabled={maxReached < item.n}
            aria-label={item.label}
          >
            <span className={s.stepper__circle}>
              {maxReached > item.n ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d={item.icon} />
                </svg>
              )}
            </span>
            <span className={s.stepper__text}>{item.label}</span>
          </button>
          {i < STEPPER_ITEMS.length - 1 && (
            <div
              className={cn(
                s.stepper__bar,
                maxReached > item.n && s["stepper__bar--filled"],
              )}
            />
          )}
        </div>
      ))}
    </nav>
  );
}
