import { useState, type FormEvent } from "react";
import type { IngredientRequest } from "../types";
import { Modal } from "./Modal";

type IngredientFormModalProps = {
  title: string;
  closeLabel: string;
  submitLabel: string;
  savingLabel: string;
  error: string;
  saving: boolean;
  initialValue?: IngredientRequest;
  onClose: () => void;
  onSubmit: (input: IngredientRequest) => Promise<boolean>;
};

export function IngredientFormModal({
  title,
  closeLabel,
  submitLabel,
  savingLabel,
  error,
  saving,
  initialValue,
  onClose,
  onSubmit,
}: IngredientFormModalProps) {
  const [label, setLabel] = useState(initialValue?.label || "");
  const [caloriesPer100g, setCaloriesPer100g] = useState(
    initialValue ? String(initialValue.caloriesPer100g) : ""
  );
  const [proteinPer100g, setProteinPer100g] = useState(
    initialValue ? String(initialValue.proteinPer100g) : ""
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await onSubmit({
      label,
      caloriesPer100g: Number(caloriesPer100g),
      proteinPer100g: Number(proteinPer100g),
    });
    if (saved) {
      onClose();
    }
  }

  return (
    <Modal
      closeLabel={closeLabel}
      footer={
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <button
            className="rounded border border-neutral-700 px-4 py-3 text-sm font-bold text-neutral-300 transition hover:border-primary-500 hover:text-white"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rounded bg-primary-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-700"
            form="ingredient-form"
            type="submit"
            disabled={saving || !label || !caloriesPer100g || !proteinPer100g}
          >
            {saving ? savingLabel : submitLabel}
          </button>
        </div>
      }
      onClose={onClose}
      title={title}
    >
      <form className="grid gap-4" id="ingredient-form" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-medium text-neutral-300">
          Ingredient
          <input
            className="input"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Chicken breast"
            required
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-neutral-300">
            Calories per 100g
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={caloriesPer100g}
              onChange={(event) => setCaloriesPer100g(event.target.value)}
              placeholder="kcal"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-neutral-300">
            Protein per 100g
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={proteinPer100g}
              onChange={(event) => setProteinPer100g(event.target.value)}
              placeholder="g"
              required
            />
          </label>
        </div>

        {error && (
          <p className="rounded border border-primary-700 bg-primary-950 px-3 py-2 text-sm text-primary-100">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
