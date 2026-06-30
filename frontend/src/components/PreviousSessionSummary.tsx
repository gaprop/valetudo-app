import { useEffect, useState } from "react";
import type { Exercise, TrainingSession } from "../types";
import { formatWeight, labelFor, maxWeight } from "../trainingSessions";
import { Modal } from "./Modal";

type PreviousSessionSummaryProps = {
  exercises: Exercise[];
  previousSession?: TrainingSession;
  hasSelection: boolean;
};

export function PreviousSessionSummary({
  exercises,
  previousSession,
  hasSelection,
}: PreviousSessionSummaryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const exerciseLabel = previousSession
    ? labelFor(exercises, previousSession.exerciseType)
    : "";

  useEffect(() => {
    if (!previousSession) {
      setIsModalOpen(false);
    }
  }, [previousSession]);

  return (
    <>
      <div className="rounded border border-primary-800 bg-primary-950/50 text-sm text-primary-100">
      {!hasSelection ? (
        <span className="block px-4 py-3">Nothing is selected</span>
      ) : previousSession ? (
        <button
          className="block w-full rounded px-4 py-3 text-left transition hover:bg-primary-900/60 focus:outline-none focus:ring-2 focus:ring-primary-500"
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          Latest {exerciseLabel}:{" "}
          <strong>{previousSession.sets.length} sets</strong>, best at{" "}
          <strong>{formatWeight(maxWeight(previousSession.sets))}</strong>
        </button>
      ) : (
        <span className="block px-4 py-3">
          No sets logged for this exercise yet.
        </span>
      )}
      </div>

      {isModalOpen && previousSession && (
        <Modal
          closeLabel="Close previous training"
          onClose={() => setIsModalOpen(false)}
          title={exerciseLabel}
        >
          <p className="mb-4 text-sm text-neutral-400">
            {previousSession.trainingDate}
          </p>
          <div className="grid border border-neutral-800">
            <div className="grid grid-cols-[80px_1fr_1fr] border-b border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-semibold uppercase text-neutral-400">
              <span>Set</span>
              <span className="text-center">Kg</span>
              <span className="text-center">Reps</span>
            </div>
            {previousSession.sets.map((set, index) => (
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
        </Modal>
      )}
    </>
  );
}
