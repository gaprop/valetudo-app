import type { SetForm } from "../types";

type MetricInputsProps = {
  label: string;
  value: SetForm;
  onChange: (field: keyof SetForm, value: string) => void;
};

export function MetricInputs({ label, value, onChange }: MetricInputsProps) {
  return (
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <div className="mt-2 grid grid-cols-2 divide-x divide-neutral-700 overflow-hidden rounded border border-neutral-800 text-center text-sm font-semibold text-white">
        <label className="flex items-center bg-neutral-900 px-3 py-2 text-center">
          <input
            aria-label={`${label} weight in kg`}
            className="min-w-0 flex-1 bg-transparent text-center text-white outline-none"
            type="number"
            min="0"
            step="0.5"
            value={value.weight}
            onChange={(event) => onChange("weight", event.target.value)}
            required
          />
          <span className="ml-2 shrink-0 text-xs font-semibold uppercase text-neutral-500">
            kg
          </span>
        </label>
        <label className="flex items-center bg-neutral-900 px-3 py-2 text-center">
          <input
            aria-label={`${label} reps`}
            className="min-w-0 flex-1 bg-transparent text-center text-white outline-none"
            type="number"
            min="1"
            step="1"
            value={value.reps}
            onChange={(event) => onChange("reps", event.target.value)}
            required
          />
          <span className="ml-2 shrink-0 text-xs font-semibold uppercase text-neutral-500">
            reps
          </span>
        </label>
      </div>
    </div>
  );
}
