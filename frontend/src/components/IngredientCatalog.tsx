import { useEffect, useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
import type { Ingredient, IngredientRequest } from "../types";
import { IconButton } from "./IconButton";
import { IngredientFormModal } from "./IngredientFormModal";

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
  const [selectedIngredientValue, setSelectedIngredientValue] = useState("");

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

  async function handleUpdateIngredient(input: IngredientRequest) {
    if (!selectedIngredientValue) {
      return false;
    }
    return onUpdateIngredient(selectedIngredientValue, input);
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
                {selectedIngredient && (
                  <div className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-300">
                    <span className="font-semibold text-white">
                      {selectedIngredient.label}
                    </span>
                    <span className="mt-1 block text-neutral-400">
                      {selectedIngredient.caloriesPer100g} kcal,{" "}
                      {selectedIngredient.proteinPer100g}g protein per 100g
                    </span>
                  </div>
                )}
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
        <IngredientFormModal
          closeLabel="Close ingredient form"
          error={error}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={onAddIngredient}
          saving={creating}
          savingLabel="Creating..."
          submitLabel="Create ingredient"
          title="Add ingredient"
        />
      )}

      {isEditModalOpen && selectedIngredient && (
        <IngredientFormModal
          closeLabel="Close ingredient editor"
          error={error}
          initialValue={{
            label: selectedIngredient.label,
            caloriesPer100g: selectedIngredient.caloriesPer100g,
            proteinPer100g: selectedIngredient.proteinPer100g,
          }}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateIngredient}
          saving={updatingValue === selectedIngredientValue}
          savingLabel="Saving..."
          submitLabel="Save ingredient"
          title="Edit ingredient"
        />
      )}
    </>
  );
}
