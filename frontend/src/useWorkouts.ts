import { useCallback, useEffect, useState } from "react";
import {
  addWorkoutSet,
  createWorkout,
  deleteWorkout,
  deleteWorkoutSet,
  errorMessage,
  listWorkouts,
  updateWorkoutSet,
} from "./api";
import type {
  CreateWorkoutRequest,
  CreateWorkoutSetRequest,
  UpdateWorkoutSetRequest,
  Workout,
} from "./types";

type PendingState = {
  savingEntry: boolean;
  savingSetId: number | null;
  updatingSetId: number | null;
  deletingWorkoutId: number | null;
  deletingSetId: number | null;
};

const initialPendingState: PendingState = {
  savingEntry: false,
  savingSetId: null,
  updatingSetId: null,
  deletingWorkoutId: null,
  deletingSetId: null,
};

function sortWorkouts(workouts: Workout[]): Workout[] {
  return [...workouts].sort((a, b) => {
    if (a.trainingDate !== b.trainingDate) {
      return b.trainingDate.localeCompare(a.trainingDate);
    }
    return Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id - a.id;
  });
}

function updateWorkoutSets(
  workouts: Workout[],
  workoutID: number,
  update: (workout: Workout) => Workout
): Workout[] {
  return workouts.map((workout) =>
    workout.id === workoutID ? update(workout) : workout
  );
}

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingState>(initialPendingState);
  const [formError, setFormError] = useState("");
  const [entryErrors, setEntryErrors] = useState<Record<number, string>>({});
  const [openWorkoutId, setOpenWorkoutId] = useState<number | null>(null);

  const setEntryError = useCallback((workoutID: number, message: string) => {
    setEntryErrors((current) => ({ ...current, [workoutID]: message }));
  }, []);

  const clearEntryError = useCallback((workoutID: number) => {
    setEntryErrors((current) => {
      const next = { ...current };
      delete next[workoutID];
      return next;
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setFormError("");
    try {
      setWorkouts(await listWorkouts());
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createEntry(input: CreateWorkoutRequest): Promise<void> {
    setPending((current) => ({ ...current, savingEntry: true }));
    setFormError("");

    try {
      const workout = await createWorkout(input);
      setWorkouts((current) => sortWorkouts([workout, ...current]));
      setOpenWorkoutId(workout.id);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setPending((current) => ({ ...current, savingEntry: false }));
    }
  }

  async function deleteEntry(workoutID: number): Promise<void> {
    setPending((current) => ({ ...current, deletingWorkoutId: workoutID }));
    clearEntryError(workoutID);

    try {
      await deleteWorkout({ workoutID });
      setWorkouts((current) =>
        current.filter((workout) => workout.id !== workoutID)
      );
      setOpenWorkoutId((current) => (current === workoutID ? null : current));
    } catch (err) {
      setEntryError(workoutID, errorMessage(err));
    } finally {
      setPending((current) => ({ ...current, deletingWorkoutId: null }));
    }
  }

  async function addSet(input: CreateWorkoutSetRequest): Promise<boolean> {
    setPending((current) => ({ ...current, savingSetId: input.workoutID }));
    clearEntryError(input.workoutID);

    try {
      const workoutSet = await addWorkoutSet(input);
      setWorkouts((current) =>
        updateWorkoutSets(current, input.workoutID, (workout) => ({
          ...workout,
          sets: [...workout.sets, workoutSet].sort(
            (a, b) =>
              Date.parse(a.createdAt) - Date.parse(b.createdAt) || a.id - b.id
          ),
        }))
      );
      return true;
    } catch (err) {
      setEntryError(input.workoutID, errorMessage(err));
      return false;
    } finally {
      setPending((current) => ({ ...current, savingSetId: null }));
    }
  }

  async function updateSet(input: UpdateWorkoutSetRequest): Promise<void> {
    setPending((current) => ({ ...current, updatingSetId: input.setID }));
    clearEntryError(input.workoutID);

    try {
      const workoutSet = await updateWorkoutSet(input);
      setWorkouts((current) =>
        updateWorkoutSets(current, input.workoutID, (workout) => ({
          ...workout,
          sets: workout.sets.map((set) =>
            set.id === input.setID ? workoutSet : set
          ),
        }))
      );
    } catch (err) {
      setEntryError(input.workoutID, errorMessage(err));
    } finally {
      setPending((current) => ({ ...current, updatingSetId: null }));
    }
  }

  async function removeSet(workoutID: number, setID: number): Promise<void> {
    setPending((current) => ({ ...current, deletingSetId: setID }));
    clearEntryError(workoutID);

    try {
      await deleteWorkoutSet({ workoutID, setID });
      setWorkouts((current) =>
        updateWorkoutSets(current, workoutID, (workout) => ({
          ...workout,
          sets: workout.sets.filter((set) => set.id !== setID),
        }))
      );
    } catch (err) {
      setEntryError(workoutID, errorMessage(err));
    } finally {
      setPending((current) => ({ ...current, deletingSetId: null }));
    }
  }

  function toggleWorkout(workoutID: number): void {
    setOpenWorkoutId((current) => (current === workoutID ? null : workoutID));
  }

  return {
    workouts,
    loading,
    pending,
    formError,
    entryErrors,
    openWorkoutId,
    load,
    createEntry,
    deleteEntry,
    addSet,
    updateSet,
    removeSet,
    toggleWorkout,
  };
}
