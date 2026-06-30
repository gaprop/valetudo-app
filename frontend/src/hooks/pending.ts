import type { Dispatch, SetStateAction } from "react";

export function setPendingField<T, K extends keyof T>(
  setPending: Dispatch<SetStateAction<T>>,
  key: K,
  value: T[K]
) {
  setPending((current) => ({ ...current, [key]: value }));
}
