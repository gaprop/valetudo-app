import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { SetForm, WorkoutSet } from "../types";
import { ActionButton } from "./ActionButton";
import { IconButton } from "./IconButton";
import { MetricInputs } from "./MetricInputs";

type WorkoutSetRowProps = {
  workoutSet: WorkoutSet;
  displayNumber: number;
  updatingSetId: number | null;
  deletingSetId: number | null;
  onUpdate: (form: SetForm) => void;
  onDelete: () => void;
};

export function WorkoutSetRow({
  workoutSet,
  displayNumber,
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
      <MetricInputs
        label={`Set ${displayNumber}`}
        value={form}
        onChange={(field, value) =>
          setForm((current) => ({ ...current, [field]: value }))
        }
      />
      <div className="grid grid-cols-[1fr_auto] gap-2 sm:w-40">
        <ActionButton type="submit" disabled={updatingSetId === workoutSet.id}>
          {updatingSetId === workoutSet.id ? "Saving" : "Save"}
        </ActionButton>
        <IconButton
          label={`Remove set ${displayNumber}`}
          title="Remove set"
          onClick={onDelete}
          disabled={deletingSetId === workoutSet.id}
        >
          <X aria-hidden="true" size={16} strokeWidth={2.25} />
        </IconButton>
      </div>
    </form>
  );
}
