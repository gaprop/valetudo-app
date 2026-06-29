import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Exercise, ID, SetForm, TrainingSession } from "../types";
import { formatWeight, labelFor, maxWeight } from "../trainingSessions";
import { ActionButton } from "./ActionButton";
import { IconButton } from "./IconButton";
import { SetMetricInputs } from "./SetMetricInputs";
import { TrainingSetRow } from "./TrainingSetRow";

type TrainingSessionCardProps = {
  trainingSession: TrainingSession;
  exercises: Exercise[];
  error: string;
  savingSetId: ID | null;
  updatingSetId: ID | null;
  deletingTrainingSessionId: ID | null;
  deletingSetId: ID | null;
  isOpen: boolean;
  onToggle: () => void;
  onAddSet: (form: SetForm) => Promise<boolean>;
  onUpdateSet: (setID: ID, form: SetForm) => void;
  onDeleteTrainingSession: () => void;
  onDeleteSet: (setID: ID) => void;
};

export function TrainingSessionCard({
  trainingSession,
  exercises,
  error,
  savingSetId,
  updatingSetId,
  deletingTrainingSessionId,
  deletingSetId,
  isOpen,
  onToggle,
  onAddSet,
  onUpdateSet,
  onDeleteTrainingSession,
  onDeleteSet,
}: TrainingSessionCardProps) {
  const [setForm, setSetForm] = useState<SetForm>({ weight: "", reps: "" });

  async function handleAddSet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await onAddSet(setForm)) {
      setSetForm({ weight: "", reps: "" });
    }
  }

  return (
    <article className="bg-neutral-900">
      <div className="grid gap-3 border-l-4 border-transparent bg-neutral-800/40 px-5 py-4 transition hover:border-primary-600 hover:bg-neutral-800 sm:grid-cols-[1fr_auto_auto] sm:items-center">
        <button
          className="min-w-0 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-700"
          type="button"
          aria-expanded={isOpen}
          onClick={onToggle}
        >
          <span className="block text-base font-semibold text-white">
            {labelFor(exercises, trainingSession.exerciseType)}
          </span>
        </button>
        <span className="flex flex-wrap items-center gap-2 text-sm text-neutral-300 sm:justify-end">
          <span className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1">
            {trainingSession.sets.length} {trainingSession.sets.length === 1 ? "set" : "sets"}
          </span>
          <span className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1">
            Best {formatWeight(maxWeight(trainingSession.sets))}
          </span>
        </span>
        <div className="flex flex-wrap gap-2 sm:justify-self-end">
          <button
            className="flex h-9 min-w-24 items-center justify-center rounded border border-primary-800 bg-primary-950/60 px-3 text-sm font-semibold text-primary-100 transition hover:border-primary-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-700"
            type="button"
            aria-expanded={isOpen}
            onClick={onToggle}
          >
            {isOpen ? "Close" : "Open"}
          </button>
          <IconButton
            label={`Delete ${labelFor(exercises, trainingSession.exerciseType)} training on ${trainingSession.trainingDate}`}
            title="Delete training"
            onClick={onDeleteTrainingSession}
            disabled={deletingTrainingSessionId === trainingSession.id}
          >
            <X aria-hidden="true" size={16} strokeWidth={2.25} />
          </IconButton>
        </div>
      </div>

      {isOpen && (
        <div className="grid gap-5 border-t border-neutral-800 bg-neutral-950/50 px-5 py-5">
          {error && (
            <p className="rounded border border-primary-700 bg-primary-950 px-3 py-2 text-sm text-primary-100">
              {error}
            </p>
          )}

          <div>
            {trainingSession.sets.length === 0 ? (
              <p className="text-sm text-neutral-500">No sets added yet.</p>
            ) : (
              <div className="grid gap-2">
                {trainingSession.sets.map((set, index) => (
                  <TrainingSetRow
                    key={set.id}
                    trainingSet={set}
                    displayNumber={index + 1}
                    updatingSetId={updatingSetId}
                    deletingSetId={deletingSetId}
                    onUpdate={(form) => onUpdateSet(set.id, form)}
                    onDelete={() => onDeleteSet(set.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <form
            className="grid gap-3 rounded border border-neutral-800 bg-neutral-950 px-3 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
            onSubmit={handleAddSet}
          >
            <SetMetricInputs
              label="New set"
              value={setForm}
              onChange={(field, value) =>
                setSetForm((current) => ({ ...current, [field]: value }))
              }
            />
            <div className="grid gap-2 sm:w-40">
              <ActionButton type="submit" disabled={savingSetId === trainingSession.id}>
                {savingSetId === trainingSession.id ? "Adding" : "Add set"}
              </ActionButton>
            </div>
          </form>
        </div>
      )}
    </article>
  );
}
