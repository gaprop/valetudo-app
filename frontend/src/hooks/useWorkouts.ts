import { useCallback, useEffect, useState } from "react";
import { errorMessage } from "../api";
import { workoutsService } from "../services";
import { sortWorkoutSets, sortWorkouts } from "../sorting";
import type {
  CreateWorkoutRequest,
  CreateWorkoutSetRequest,
  UpdateWorkoutSetRequest,
  Workout,
} from "../types";

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
      setWorkouts(sortWorkouts(await workoutsService.list()));
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createEntry(input: CreateWorkoutRequest): Promise<boolean> {
    setPending((current) => ({ ...current, savingEntry: true }));
    setFormError("");

    try {
      const workout = await workoutsService.create(input);
      setWorkouts((current) => sortWorkouts([workout, ...current]));
      setOpenWorkoutId(workout.id);
      return true;
    } catch (err) {
      setFormError(errorMessage(err));
      return false;
    } finally {
      setPending((current) => ({ ...current, savingEntry: false }));
    }
  }

  async function deleteEntry(workoutID: number): Promise<void> {
    setPending((current) => ({ ...current, deletingWorkoutId: workoutID }));
    clearEntryError(workoutID);

    try {
      await workoutsService.delete({ workoutID });
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
      const workoutSet = await workoutsService.addSet(input);
      setWorkouts((current) =>
        updateWorkoutSets(current, input.workoutID, (workout) => ({
          ...workout,
          sets: sortWorkoutSets([...workout.sets, workoutSet]),
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
      const workoutSet = await workoutsService.updateSet(input);
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
      await workoutsService.deleteSet({ workoutID, setID });
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
