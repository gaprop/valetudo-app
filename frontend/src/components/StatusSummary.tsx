import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";
import type { Exercise, Workout } from "../types";
import { formatWeight, labelFor, maxWeight } from "../workouts";
import { IconButton } from "./IconButton";

type StatusSummaryProps = {
  exercises: Exercise[];
  currentWorkout?: Workout;
  hasSelection: boolean;
};

export function StatusSummary({
  exercises,
  currentWorkout,
  hasSelection,
}: StatusSummaryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const titleId = useId();
  const exerciseLabel = currentWorkout
    ? labelFor(exercises, currentWorkout.exerciseType)
    : "";

  useEffect(() => {
    if (!currentWorkout) {
      setIsModalOpen(false);
    }
  }, [currentWorkout]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isModalOpen]);

  return (
    <>
      <div className="rounded border border-primary-800 bg-primary-950/50 text-sm text-primary-100">
      {!hasSelection ? (
        <span className="block px-4 py-3">Nothing is selected</span>
      ) : currentWorkout ? (
        <button
          className="block w-full rounded px-4 py-3 text-left transition hover:bg-primary-900/60 focus:outline-none focus:ring-2 focus:ring-primary-500"
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          Latest {exerciseLabel}:{" "}
          <strong>{currentWorkout.sets.length} sets</strong>, best at{" "}
          <strong>{formatWeight(maxWeight(currentWorkout.sets))}</strong>
        </button>
      ) : (
        <span className="block px-4 py-3">
          No sets logged for this exercise yet.
        </span>
      )}
      </div>

      {isModalOpen && currentWorkout && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 py-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <section
            aria-labelledby={titleId}
            aria-modal="true"
            className="grid max-h-[85vh] w-full max-w-md gap-4 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 shadow-2xl shadow-black"
            role="dialog"
          >
            <header className="flex items-start justify-between gap-3 border-b border-neutral-800 px-5 py-4">
              <div>
                <h2 id={titleId} className="text-lg font-semibold text-white">
                  {exerciseLabel}
                </h2>
                <p className="mt-1 text-sm text-neutral-400">
                  {currentWorkout.trainingDate}
                </p>
              </div>
              <IconButton
                label="Close previous training"
                title="Close"
                onClick={() => setIsModalOpen(false)}
              >
                <X aria-hidden="true" size={16} strokeWidth={2.25} />
              </IconButton>
            </header>

            <div className="overflow-y-auto px-5 pb-5">
              <div className="grid border border-neutral-800">
                <div className="grid grid-cols-[80px_1fr_1fr] border-b border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-semibold uppercase text-neutral-400">
                  <span>Set</span>
                  <span className="text-center">Kg</span>
                  <span className="text-center">Reps</span>
                </div>
                {currentWorkout.sets.map((set, index) => (
                  <div
                    className="grid grid-cols-[80px_1fr_1fr] border-b border-neutral-800 px-3 py-3 text-sm text-neutral-100 last:border-b-0"
                    key={set.id}
                  >
                    <span className="font-semibold text-white">{index + 1}</span>
                    <span className="border-l border-neutral-800 text-center">
                      {formatWeight(set.weight)}
                    </span>
                    <span className="border-l border-neutral-800 text-center">
                      {set.reps}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
