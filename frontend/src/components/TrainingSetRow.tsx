import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { ID, SetForm, TrainingSet } from "../types";
import { ActionButton } from "./ActionButton";
import { IconButton } from "./IconButton";
import { SetMetricInputs } from "./SetMetricInputs";

type TrainingSetRowProps = {
  trainingSet: TrainingSet;
  displayNumber: number;
  updatingSetId: ID | null;
  deletingSetId: ID | null;
  onUpdate: (form: SetForm) => void;
  onDelete: () => void;
};

export function TrainingSetRow({
  trainingSet,
  displayNumber,
  updatingSetId,
  deletingSetId,
  onUpdate,
  onDelete,
}: TrainingSetRowProps) {
  const [form, setForm] = useState<SetForm>({
    weight: String(trainingSet.weight),
    reps: String(trainingSet.reps),
  });

  useEffect(() => {
    setForm({
      weight: String(trainingSet.weight),
      reps: String(trainingSet.reps),
    });
  }, [trainingSet.reps, trainingSet.weight]);

  return (
    <form
      className="grid gap-3 rounded border border-neutral-800 bg-neutral-950 px-3 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
      onSubmit={(event) => {
        event.preventDefault();
        onUpdate(form);
      }}
    >
      <SetMetricInputs
        label={`Set ${displayNumber}`}
        value={form}
        onChange={(field, value) =>
          setForm((current) => ({ ...current, [field]: value }))
        }
      />
      <div className="grid grid-cols-[1fr_auto] gap-2 sm:w-40">
        <ActionButton type="submit" disabled={updatingSetId === trainingSet.id}>
          {updatingSetId === trainingSet.id ? "Saving" : "Save"}
        </ActionButton>
        <IconButton
          label={`Remove set ${displayNumber}`}
          title="Remove set"
          onClick={onDelete}
          disabled={deletingSetId === trainingSet.id}
        >
          <X aria-hidden="true" size={16} strokeWidth={2.25} />
        </IconButton>
      </div>
    </form>
  );
}
