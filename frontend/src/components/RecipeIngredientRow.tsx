import { Save, X } from "lucide-react";
import { useRecipeIngredientForm } from "../hooks";
import type {
  ID,
  Ingredient,
  RecipeIngredient,
  UpdateRecipeIngredientRequest,
} from "../types";
import { NumberField, SelectField } from "./FormFields";
import { IconButton } from "./IconButton";

type RecipeIngredientRowProps = {
  recipeID: ID;
  ingredient: RecipeIngredient;
  ingredients: Ingredient[];
  saving: boolean;
  deleting: boolean;
  onUpdateIngredient: (
    input: UpdateRecipeIngredientRequest
  ) => Promise<boolean>;
  onDeleteIngredient: () => void;
};

function labelFor(ingredients: Ingredient[], value: string) {
  return (
    ingredients.find((ingredient) => ingredient.value === value)?.label || value
  );
}

export function RecipeIngredientRow({
  recipeID,
  ingredient,
  ingredients,
  saving,
  deleting,
  onUpdateIngredient,
  onDeleteIngredient,
}: RecipeIngredientRowProps) {
  const recipeIngredientForm = useRecipeIngredientForm({
    recipeID,
    ingredient,
    ingredients,
    onUpdateIngredient,
  });

  return (
    <div className="grid gap-3 rounded border border-neutral-800 bg-neutral-950 p-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_auto] lg:items-end">
      <SelectField
        fieldSize="compact"
        label="Ingredient"
        labelClassName="text-xs font-semibold text-neutral-400"
        value={recipeIngredientForm.form.ingredientValue}
        onChange={(event) => {
          recipeIngredientForm.setIngredientValue(event.target.value);
        }}
        disabled={ingredients.length === 0}
      >
        {ingredients.length === 0 ? (
          <option value={recipeIngredientForm.form.ingredientValue}>
            {labelFor(ingredients, recipeIngredientForm.form.ingredientValue)}
          </option>
        ) : (
          ingredients.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))
        )}
      </SelectField>
      <NumberField
        fieldSize="compact"
        label="Grams"
        labelClassName="text-xs font-semibold text-neutral-400"
        min="0.01"
        step="0.01"
        value={recipeIngredientForm.form.amountGrams}
        onChange={(event) => {
          recipeIngredientForm.setAmountGrams(event.target.value);
        }}
        placeholder="100"
        required
      />
      <NumberField
        fieldSize="compact"
        label="Calories"
        labelClassName="text-xs font-semibold text-neutral-400"
        min="0"
        step="0.01"
        value={recipeIngredientForm.form.calories}
        onChange={(event) => {
          recipeIngredientForm.setCalories(event.target.value);
        }}
        placeholder="kcal"
        required
      />
      <NumberField
        fieldSize="compact"
        label="Protein"
        labelClassName="text-xs font-semibold text-neutral-400"
        min="0"
        step="0.01"
        value={recipeIngredientForm.form.protein}
        onChange={(event) => {
          recipeIngredientForm.setProtein(event.target.value);
        }}
        placeholder="g"
        required
      />
      <div className="flex justify-end gap-2 sm:col-span-2 lg:col-span-1">
        <IconButton
          label="Save ingredient"
          title="Save ingredient"
          onClick={recipeIngredientForm.save}
          disabled={
            !recipeIngredientForm.hasChanges ||
            saving ||
            !recipeIngredientForm.form.amountGrams ||
            !recipeIngredientForm.form.calories ||
            !recipeIngredientForm.form.protein
          }
        >
          <Save aria-hidden="true" size={16} strokeWidth={2.25} />
        </IconButton>
        <IconButton
          label="Delete ingredient from recipe"
          title="Delete ingredient"
          onClick={onDeleteIngredient}
          disabled={deleting}
        >
          <X aria-hidden="true" size={16} strokeWidth={2.25} />
        </IconButton>
      </div>
    </div>
  );
}
