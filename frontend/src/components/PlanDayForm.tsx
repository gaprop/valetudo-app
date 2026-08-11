import { useState, type FormEvent } from "react";
import type { CreatePlanDayRequest } from "../types";
import { TextField } from "./FormFields";

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
      className="rounded-lg border border-neutral-800 bg-neutral-900 p-3 shadow-2xl shadow-black/30 sm:p-5"
      onSubmit={handleAddDay}
    >
      <h2 className="text-lg font-semibold text-white">Add day</h2>
      <TextField
        label="Day"
        labelClassName="mt-4 sm:mt-5"
        value={dayName}
        onChange={(event) => setDayName(event.target.value)}
        placeholder="Push day"
        required
      />
      {error && (
        <p className="mt-4 rounded border border-primary-700 bg-primary-950 px-3 py-2 text-sm text-primary-100">
          {error}
        </p>
      )}
      <button
        className="mt-4 w-full rounded bg-primary-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-700 sm:mt-5"
        type="submit"
        disabled={creatingDay}
      >
        {creatingDay ? "Creating..." : "Create day"}
      </button>
    </form>
  );
}
