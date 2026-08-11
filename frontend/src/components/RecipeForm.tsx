import { useState, type FormEvent } from "react";
import type { CreateRecipeRequest } from "../types";
import { TextField } from "./FormFields";

type RecipeFormProps = {
  creating: boolean;
  onAddRecipe: (input: CreateRecipeRequest) => Promise<boolean>;
};

export function RecipeForm({ creating, onAddRecipe }: RecipeFormProps) {
  const [name, setName] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await onAddRecipe({ name })) {
      setName("");
    }
  }

  return (
    <form
      className="rounded-lg border border-neutral-800 bg-neutral-900 p-3 shadow-2xl shadow-black/30 sm:p-5"
      onSubmit={handleSubmit}
    >
      <h2 className="text-lg font-semibold text-white">Add recipe</h2>
      <TextField
        label="Recipe"
        labelClassName="mt-4 sm:mt-5"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Chicken bowl"
        required
      />
      <button
        className="mt-4 w-full rounded bg-primary-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-700 sm:mt-5"
        type="submit"
        disabled={creating}
      >
        {creating ? "Creating..." : "Create recipe"}
      </button>
    </form>
  );
}
