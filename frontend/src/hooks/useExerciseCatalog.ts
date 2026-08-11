import { useCallback, useEffect, useState } from "react";
import { errorMessage } from "../api";
import { exerciseCatalogService } from "../services";
import { sortExercises } from "../sorting";
import type { Exercise } from "../types";
import { runAsyncAction } from "./asyncAction";

export function useExerciseCatalog() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingValue, setDeletingValue] = useState<string | null>(null);

  const load = useCallback(async () => {
    await runAsyncAction({
      before: () => {
        setLoading(true);
        setError("");
      },
      action: async () => {
        setExercises(sortExercises(await exerciseCatalogService.list()));
      },
      onError: (error) => setError(errorMessage(error)),
      after: () => setLoading(false),
      fallback: undefined,
    });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function addExercise(label: string): Promise<boolean> {
    return runAsyncAction({
      before: () => {
        setCreating(true);
        setError("");
      },
      action: async () => {
        const exercise = await exerciseCatalogService.create({ label });
        setExercises((current) => sortExercises([...current, exercise]));
        return true;
      },
      onError: (error) => setError(errorMessage(error)),
      after: () => setCreating(false),
      fallback: false,
    });
  }

  async function removeExercise(value: string): Promise<void> {
    await runAsyncAction({
      before: () => {
        setDeletingValue(value);
        setError("");
      },
      action: async () => {
        await exerciseCatalogService.delete({ value });
        setExercises((current) =>
          current.filter((exercise) => exercise.value !== value)
        );
      },
      onError: (error) => setError(errorMessage(error)),
      after: () => setDeletingValue(null),
      fallback: undefined,
    });
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
