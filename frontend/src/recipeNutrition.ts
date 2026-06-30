export function nutritionForGrams(per100g: number, gramsInput: string | number) {
  const grams = Number(gramsInput);
  if (!Number.isFinite(grams)) {
    return 0;
  }

  return (grams / 100) * per100g;
}
