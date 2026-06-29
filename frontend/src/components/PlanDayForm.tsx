import { useState, type FormEvent } from "react";
import type { CreatePlanDayRequest } from "../types";

type PlanDayFormProps = {
  error: string;
  creatingDay: boolean;
  onAddDay: (input: CreatePlanDayRequest) => Promise<boolean>;
};

export function PlanDayForm({
  error,
  creatingDay,
  onAddDay,
}: PlanDayFormProps) {
  const [dayName, setDayName] = useState("");

  async function handleAddDay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await onAddDay({ name: dayName })) {
      setDayName("");
    }
  }

  return (
    <form
      className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 shadow-2xl shadow-black/30"
      onSubmit={handleAddDay}
    >
      <h2 className="text-lg font-semibold text-white">Add day</h2>
      <label className="mt-5 grid gap-2 text-sm font-medium text-neutral-300">
        Day
        <input
          className="input"
          value={dayName}
          onChange={(event) => setDayName(event.target.value)}
          placeholder="Push day"
          required
        />
      </label>
      {error && (
        <p className="mt-4 rounded border border-primary-700 bg-primary-950 px-3 py-2 text-sm text-primary-100">
          {error}
        </p>
      )}
      <button
        className="mt-5 w-full rounded bg-primary-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-700"
        type="submit"
        disabled={creatingDay}
      >
        {creatingDay ? "Creating..." : "Create day"}
      </button>
    </form>
  );
}
