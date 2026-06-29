import { useCallback, useEffect, useState } from "react";
import { errorMessage } from "../api";
import { exerciseCatalogService } from "../services";
import type { Exercise } from "../types";

export function useExerciseCatalog() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingValue, setDeletingValue] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setExercises(await exerciseCatalogService.list());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function addExercise(label: string): Promise<boolean> {
    setCreating(true);
    setError("");
    try {
      const exercise = await exerciseCatalogService.create({ label });
      setExercises((current) =>
        [...current, exercise].sort((a, b) =>
          a.label.localeCompare(b.label) || a.value.localeCompare(b.value)
        )
      );
      return true;
    } catch (err) {
      setError(errorMessage(err));
      return false;
    } finally {
      setCreating(false);
    }
  }

  async function removeExercise(value: string): Promise<void> {
    setDeletingValue(value);
    setError("");
    try {
      await exerciseCatalogService.delete({ value });
      setExercises((current) =>
        current.filter((exercise) => exercise.value !== value)
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setDeletingValue(null);
    }
  }

  return {
    exercises,
    loading,
    error,
    creating,
    deletingValue,
    load,
    addExercise,
    removeExercise,
  };
}
