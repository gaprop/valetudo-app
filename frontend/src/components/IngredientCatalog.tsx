import { useEffect, useId, useState, type FormEvent } from "react";
import { Pencil, Plus, X } from "lucide-react";
import type { Ingredient, IngredientRequest } from "../types";
import { IconButton } from "./IconButton";

type IngredientCatalogProps = {
  ingredients: Ingredient[];
  loading: boolean;
  error: string;
  creating: boolean;
  updatingValue: string | null;
  deletingValue: string | null;
  onAddIngredient: (input: IngredientRequest) => Promise<boolean>;
  onUpdateIngredient: (
    value: string,
    input: IngredientRequest
  ) => Promise<boolean>;
  onDeleteIngredient: (value: string) => void;
};

export function IngredientCatalog({
  ingredients,
  loading,
  error,
  creating,
  updatingValue,
  deletingValue,
  onAddIngredient,
  onUpdateIngredient,
  onDeleteIngredient,
}: IngredientCatalogProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [ingredientName, setIngredientName] = useState("");
  const [ingredientCalories, setIngredientCalories] = useState("");
  const [ingredientProtein, setIngredientProtein] = useState("");
  const [selectedIngredientValue, setSelectedIngredientValue] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [selectedCalories, setSelectedCalories] = useState("");
  const [selectedProtein, setSelectedProtein] = useState("");
  const createTitleId = useId();
  const editTitleId = useId();

  useEffect(() => {
    if (
      ingredients.length > 0 &&
      !ingredients.some(
        (ingredient) => ingredient.value === selectedIngredientValue
      )
    ) {
      setSelectedIngredientValue(ingredients[0].value);
    }
    if (ingredients.length === 0 && selectedIngredientValue !== "") {
      setSelectedIngredientValue("");
    }
  }, [ingredients, selectedIngredientValue]);

  const selectedIngredient =
    ingredients.find(
      (ingredient) => ingredient.value === selectedIngredientValue
    ) || null;

  useEffect(() => {
    if (!selectedIngredient) {
      setSelectedLabel("");
      setSelectedCalories("");
      setSelectedProtein("");
      return;
    }

    setSelectedLabel(selectedIngredient.label);
    setSelectedCalories(String(selectedIngredient.caloriesPer100g));
    setSelectedProtein(String(selectedIngredient.proteinPer100g));
  }, [selectedIngredient]);

  useEffect(() => {
    if (!isCreateModalOpen && !isEditModalOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isCreateModalOpen, isEditModalOpen]);

  async function handleAddIngredient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      await onAddIngredient({
        label: ingredientName,
        caloriesPer100g: Number(ingredientCalories),
        proteinPer100g: Number(ingredientProtein),
      })
    ) {
      setIngredientName("");
      setIngredientCalories("");
      setIngredientProtein("");
      setIsCreateModalOpen(false);
    }
  }

  async function handleUpdateIngredientSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedIngredientValue) {
      return;
    }

    if (
      await onUpdateIngredient(selectedIngredientValue, {
        label: selectedLabel,
        caloriesPer100g: Number(selectedCalories),
        proteinPer100g: Number(selectedProtein),
      })
    ) {
      setIsEditModalOpen(false);
    }
  }

  return (
    <>
      <section className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 shadow-2xl shadow-black/30">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Ingredients</h2>
          <button
            className="flex items-center gap-2 rounded bg-primary-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-primary-500"
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus aria-hidden="true" size={15} strokeWidth={2.25} />
            Add
          </button>
        </div>

        {error && !isCreateModalOpen && !isEditModalOpen && (
          <p className="mt-4 rounded border border-primary-700 bg-primary-950 px-3 py-2 text-sm text-primary-100">
            {error}
          </p>
        )}

        <div className="mt-5 grid gap-3">
          {loading ? (
            <p className="text-sm text-neutral-400">Loading ingredients...</p>
          ) : ingredients.length === 0 ? (
            <p className="text-sm text-neutral-500">No ingredients yet.</p>
          ) : (
            <div className="grid gap-3">
              <label className="grid gap-2 text-sm font-medium text-neutral-300">
                Existing ingredient
                <select
                  className="input"
                  value={selectedIngredientValue}
                  onChange={(event) =>
                    setSelectedIngredientValue(event.target.value)
                  }
                >
                  {ingredients.map((ingredient) => (
                    <option key={ingredient.value} value={ingredient.value}>
                      {ingredient.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-300">
                  <span className="font-semibold text-white">
                    {selectedLabel}
                  </span>
                  <span className="mt-1 block text-neutral-400">
                    {selectedCalories} kcal, {selectedProtein}g protein per 100g
                  </span>
                </div>
                <div className="flex gap-2">
                  <IconButton
                    label="Edit selected ingredient"
                    title="Edit ingredient"
                    onClick={() => setIsEditModalOpen(true)}
                    disabled={!selectedIngredientValue}
                  >
                    <Pencil aria-hidden="true" size={16} strokeWidth={2.25} />
                  </IconButton>
                  <IconButton
                    label="Delete selected ingredient"
                    title="Delete ingredient"
                    onClick={() => onDeleteIngredient(selectedIngredientValue)}
                    disabled={
                      !selectedIngredientValue ||
                      deletingValue === selectedIngredientValue
                    }
                  >
                    <X aria-hidden="true" size={16} strokeWidth={2.25} />
                  </IconButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 py-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsCreateModalOpen(false);
            }
          }}
        >
          <form
            aria-labelledby={createTitleId}
            aria-modal="true"
            className="grid max-h-[85vh] w-full max-w-lg gap-0 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 shadow-2xl shadow-black"
            role="dialog"
            onSubmit={handleAddIngredient}
          >
            <header className="flex items-start justify-between gap-3 border-b border-neutral-800 px-5 py-4">
              <div>
                <h2
                  id={createTitleId}
                  className="text-lg font-semibold text-white"
                >
                  Add ingredient
                </h2>
              </div>
              <IconButton
                label="Close ingredient form"
                title="Close"
                onClick={() => setIsCreateModalOpen(false)}
              >
                <X aria-hidden="true" size={16} strokeWidth={2.25} />
              </IconButton>
            </header>

            <div className="grid gap-4 overflow-y-auto p-5">
              <label className="grid gap-2 text-sm font-medium text-neutral-300">
                Ingredient
                <input
                  className="input"
                  value={ingredientName}
                  onChange={(event) => setIngredientName(event.target.value)}
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
                    value={ingredientCalories}
                    onChange={(event) =>
                      setIngredientCalories(event.target.value)
                    }
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
                    value={ingredientProtein}
                    onChange={(event) =>
                      setIngredientProtein(event.target.value)
                    }
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
            </div>

            <footer className="grid gap-3 border-t border-neutral-800 px-5 py-4 sm:grid-cols-[1fr_auto]">
              <button
                className="rounded border border-neutral-700 px-4 py-3 text-sm font-bold text-neutral-300 transition hover:border-primary-500 hover:text-white"
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="rounded bg-primary-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-700"
                type="submit"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create ingredient"}
              </button>
            </footer>
          </form>
        </div>
      )}

      {isEditModalOpen && selectedIngredient && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 py-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsEditModalOpen(false);
            }
          }}
        >
          <form
            aria-labelledby={editTitleId}
            aria-modal="true"
            className="grid max-h-[85vh] w-full max-w-lg gap-0 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 shadow-2xl shadow-black"
            role="dialog"
            onSubmit={handleUpdateIngredientSubmit}
          >
            <header className="flex items-start justify-between gap-3 border-b border-neutral-800 px-5 py-4">
              <div>
                <h2
                  id={editTitleId}
                  className="text-lg font-semibold text-white"
                >
                  Edit ingredient
                </h2>
              </div>
              <IconButton
                label="Close ingredient editor"
                title="Close"
                onClick={() => setIsEditModalOpen(false)}
              >
                <X aria-hidden="true" size={16} strokeWidth={2.25} />
              </IconButton>
            </header>

            <div className="grid gap-4 overflow-y-auto p-5">
              <label className="grid gap-2 text-sm font-medium text-neutral-300">
                Ingredient
                <input
                  className="input"
                  value={selectedLabel}
                  onChange={(event) => setSelectedLabel(event.target.value)}
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
                    value={selectedCalories}
                    onChange={(event) =>
                      setSelectedCalories(event.target.value)
                    }
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
                    value={selectedProtein}
                    onChange={(event) =>
                      setSelectedProtein(event.target.value)
                    }
                    required
                  />
                </label>
              </div>

              {error && (
                <p className="rounded border border-primary-700 bg-primary-950 px-3 py-2 text-sm text-primary-100">
                  {error}
                </p>
              )}
            </div>

            <footer className="grid gap-3 border-t border-neutral-800 px-5 py-4 sm:grid-cols-[1fr_auto]">
              <button
                className="rounded border border-neutral-700 px-4 py-3 text-sm font-bold text-neutral-300 transition hover:border-primary-500 hover:text-white"
                type="button"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="rounded bg-primary-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-700"
                type="submit"
                disabled={
                  updatingValue === selectedIngredientValue ||
                  !selectedLabel ||
                  !selectedCalories ||
                  !selectedProtein
                }
              >
                {updatingValue === selectedIngredientValue
                  ? "Saving..."
                  : "Save ingredient"}
              </button>
            </footer>
          </form>
        </div>
      )}
    </>
  );
}
