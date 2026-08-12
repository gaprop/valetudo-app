import { useEffect, useState, type FormEvent } from "react";
import { formatDdMmYyyyDate, parseDdMmYyyyDate } from "../dateFormatting";
import type { Exercise, ID, TrainingSessionForm, PlanDay } from "../types";
import { SelectField, TextField } from "./FormFields";

type TrainingFormProps = {
  form: TrainingSessionForm;
  exercises: Exercise[];
  planDays: PlanDay[];
  selectedPlanDayId: ID | null;
  error: string;
  savingEntry: boolean;
  onChange: (form: TrainingSessionForm) => void;
  onPlanDayChange: (dayID: ID | null) => void;
  onSubmit: (form: TrainingSessionForm) => void;
};

export function TrainingForm({
  form,
  exercises,
  planDays,
  selectedPlanDayId,
  error,
  savingEntry,
  onChange,
  onPlanDayChange,
  onSubmit,
}: TrainingFormProps) {
  const [displayDate, setDisplayDate] = useState(() =>
    formatDdMmYyyyDate(form.trainingDate)
  );

  useEffect(() => {
    setDisplayDate(formatDdMmYyyyDate(form.trainingDate));
  }, [form.trainingDate]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      ...form,
      trainingDate: parseDdMmYyyyDate(displayDate) ?? displayDate,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-neutral-800 bg-neutral-900 p-3 shadow-2xl shadow-black/30 sm:p-5"
    >
      <h2 className="text-lg font-semibold text-white">Add training</h2>

      <div className="mt-4 grid gap-3 sm:mt-5 sm:gap-4">
        <TextField
          className="date-input"
          inputMode="numeric"
          label="Date"
          placeholder="dd/mm/yyyy"
          type="text"
          value={displayDate}
          onChange={(event) => {
            const nextDate = event.target.value;
            setDisplayDate(nextDate);
            const parsedDate = parseDdMmYyyyDate(nextDate);
            if (parsedDate) {
              onChange({ ...form, trainingDate: parsedDate });
            }
          }}
          required
        />

        <SelectField
          label="Workout plan"
          value={selectedPlanDayId ?? ""}
          onChange={(event) =>
            onPlanDayChange(
              event.target.value === "" ? null : event.target.value
            )
          }
          disabled={planDays.length === 0}
        >
          {planDays.length === 0 ? (
            <option value="">No workout plan</option>
          ) : (
            planDays.map((day) => (
              <option key={day.id} value={day.id}>
                {day.name}
              </option>
            ))
          )}
        </SelectField>

        <SelectField
          label="Exercise"
          value={form.exerciseType}
          onChange={(event) =>
            onChange({
              ...form,
              exerciseType: event.target.value,
            })
          }
          disabled={exercises.length === 0}
        >
          {exercises.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </SelectField>
      </div>

      {error && (
        <p className="mt-4 rounded border border-primary-700 bg-primary-950 px-3 py-2 text-sm text-primary-100">
          {error}
        </p>
      )}

      <button
        className="mt-4 w-full rounded bg-primary-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-700 sm:mt-5"
        type="submit"
        disabled={savingEntry || exercises.length === 0}
      >
        {savingEntry ? "Creating..." : "Create training"}
      </button>
    </form>
  );
}
