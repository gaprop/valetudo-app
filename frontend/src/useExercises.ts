import { useCallback, useEffect, useState } from "react";
import {
  createExercise,
  deleteExercise,
  errorMessage,
  listExercises,
} from "./api";
import type { Exercise } from "./types";

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingValue, setDeletingValue] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setExercises(await listExercises());
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
      const exercise = await createExercise({ label });
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
      await deleteExercise({ value });
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
