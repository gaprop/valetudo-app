import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { WorkoutSet } from "../types";
import type { SetForm } from "../types";

type WorkoutSetRowProps = {
  workoutSet: WorkoutSet;
  updatingSetId: number | null;
  deletingSetId: number | null;
  onUpdate: (form: SetForm) => void;
  onDelete: () => void;
};

export function WorkoutSetRow({
  workoutSet,
  updatingSetId,
  deletingSetId,
  onUpdate,
  onDelete,
}: WorkoutSetRowProps) {
  const [form, setForm] = useState<SetForm>({
    weight: String(workoutSet.weight),
    reps: String(workoutSet.reps),
  });

  useEffect(() => {
    setForm({
      weight: String(workoutSet.weight),
      reps: String(workoutSet.reps),
    });
  }, [workoutSet.reps, workoutSet.weight]);

  return (
    <form
      className="grid gap-3 rounded border border-neutral-800 bg-neutral-950 px-3 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
      onSubmit={(event) => {
        event.preventDefault();
        onUpdate(form);
      }}
    >
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-neutral-500">
          Set {workoutSet.setNumber}
        </p>
        <div className="mt-2 grid grid-cols-2 divide-x divide-neutral-700 overflow-hidden rounded border border-neutral-800 text-center text-sm font-semibold text-white">
          <label className="flex items-center bg-neutral-900 px-3 py-2 text-center">
            <input
              aria-label={`Set ${workoutSet.setNumber} weight in kg`}
              className="min-w-0 flex-1 bg-transparent text-center text-white outline-none"
              type="number"
              min="0"
              step="0.5"
              placeholder="kg"
              value={form.weight}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  weight: event.target.value,
                }))
              }
              required
            />
            <span className="ml-2 shrink-0 text-xs font-semibold uppercase text-neutral-500">
              kg
            </span>
          </label>
          <label className="flex items-center bg-neutral-900 px-3 py-2 text-center">
            <input
              aria-label={`Set ${workoutSet.setNumber} reps`}
              className="min-w-0 flex-1 bg-transparent text-center text-white outline-none"
              type="number"
              min="1"
              step="1"
              placeholder="reps"
              value={form.reps}
              onChange={(event) =>
                setForm((current) => ({ ...current, reps: event.target.value }))
              }
              required
            />
            <span className="ml-2 shrink-0 text-xs font-semibold uppercase text-neutral-500">
              reps
            </span>
          </label>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2 sm:w-40">
        <button
          className="w-full rounded bg-primary-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-700"
          type="submit"
          disabled={updatingSetId === workoutSet.id}
        >
          {updatingSetId === workoutSet.id ? "Saving" : "Save"}
        </button>
        <button
          className="flex h-9 w-9 items-center justify-center justify-self-end rounded border border-neutral-700 text-neutral-300 transition hover:border-primary-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          aria-label={`Remove set ${workoutSet.setNumber}`}
          title="Remove set"
          onClick={onDelete}
          disabled={deletingSetId === workoutSet.id}
        >
          <X aria-hidden="true" size={16} strokeWidth={2.25} />
        </button>
      </div>
    </form>
  );
}
