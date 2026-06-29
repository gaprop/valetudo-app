import { useCallback, useEffect, useState } from "react";
import { errorMessage } from "../api";
import { trainingSessionsService } from "../services";
import { sortTrainingSets, sortTrainingSessions } from "../sorting";
import type {
  CreateTrainingSessionRequest,
  CreateTrainingSetRequest,
  ID,
  UpdateTrainingSetRequest,
  TrainingSession,
} from "../types";

type PendingState = {
  savingEntry: boolean;
  savingSetId: ID | null;
  updatingSetId: ID | null;
  deletingTrainingSessionId: ID | null;
  deletingSetId: ID | null;
};

const initialPendingState: PendingState = {
  savingEntry: false,
  savingSetId: null,
  updatingSetId: null,
  deletingTrainingSessionId: null,
  deletingSetId: null,
};

function updateTrainingSessionSets(
  trainingSessions: TrainingSession[],
  trainingSessionID: ID,
  update: (trainingSession: TrainingSession) => TrainingSession
): TrainingSession[] {
  return trainingSessions.map((trainingSession) =>
    trainingSession.id === trainingSessionID ? update(trainingSession) : trainingSession
  );
}

export function useTrainingSessions() {
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingState>(initialPendingState);
  const [formError, setFormError] = useState("");
  const [entryErrors, setEntryErrors] = useState<Record<ID, string>>({});
  const [openTrainingSessionId, setOpenTrainingSessionId] = useState<ID | null>(null);

  const setEntryError = useCallback((trainingSessionID: ID, message: string) => {
    setEntryErrors((current) => ({ ...current, [trainingSessionID]: message }));
  }, []);

  const clearEntryError = useCallback((trainingSessionID: ID) => {
    setEntryErrors((current) => {
      const next = { ...current };
      delete next[trainingSessionID];
      return next;
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setFormError("");
    try {
      setTrainingSessions(sortTrainingSessions(await trainingSessionsService.list()));
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createTrainingSession(input: CreateTrainingSessionRequest): Promise<boolean> {
    setPending((current) => ({ ...current, savingEntry: true }));
    setFormError("");

    try {
      const trainingSession = await trainingSessionsService.create(input);
      setTrainingSessions((current) => sortTrainingSessions([trainingSession, ...current]));
      setOpenTrainingSessionId(trainingSession.id);
      return true;
    } catch (err) {
      setFormError(errorMessage(err));
      return false;
    } finally {
      setPending((current) => ({ ...current, savingEntry: false }));
    }
  }

  async function deleteTrainingSession(trainingSessionID: ID): Promise<void> {
    setPending((current) => ({ ...current, deletingTrainingSessionId: trainingSessionID }));
    clearEntryError(trainingSessionID);

    try {
      await trainingSessionsService.delete({ trainingSessionID });
      setTrainingSessions((current) =>
        current.filter((trainingSession) => trainingSession.id !== trainingSessionID)
      );
      setOpenTrainingSessionId((current) => (current === trainingSessionID ? null : current));
    } catch (err) {
      setEntryError(trainingSessionID, errorMessage(err));
    } finally {
      setPending((current) => ({ ...current, deletingTrainingSessionId: null }));
    }
  }

  async function addSet(input: CreateTrainingSetRequest): Promise<boolean> {
    setPending((current) => ({ ...current, savingSetId: input.trainingSessionID }));
    clearEntryError(input.trainingSessionID);

    try {
      const trainingSet = await trainingSessionsService.addSet(input);
      setTrainingSessions((current) =>
        updateTrainingSessionSets(current, input.trainingSessionID, (trainingSession) => ({
          ...trainingSession,
          sets: sortTrainingSets([...trainingSession.sets, trainingSet]),
        }))
      );
      return true;
    } catch (err) {
      setEntryError(input.trainingSessionID, errorMessage(err));
      return false;
    } finally {
      setPending((current) => ({ ...current, savingSetId: null }));
    }
  }

  async function updateSet(input: UpdateTrainingSetRequest): Promise<void> {
    setPending((current) => ({ ...current, updatingSetId: input.setID }));
    clearEntryError(input.trainingSessionID);

    try {
      const trainingSet = await trainingSessionsService.updateSet(input);
      setTrainingSessions((current) =>
        updateTrainingSessionSets(current, input.trainingSessionID, (trainingSession) => ({
          ...trainingSession,
          sets: trainingSession.sets.map((set) =>
            set.id === input.setID ? trainingSet : set
          ),
        }))
      );
    } catch (err) {
      setEntryError(input.trainingSessionID, errorMessage(err));
    } finally {
      setPending((current) => ({ ...current, updatingSetId: null }));
    }
  }

  async function removeSet(trainingSessionID: ID, setID: ID): Promise<void> {
    setPending((current) => ({ ...current, deletingSetId: setID }));
    clearEntryError(trainingSessionID);

    try {
      await trainingSessionsService.deleteSet({ trainingSessionID, setID });
      setTrainingSessions((current) =>
        updateTrainingSessionSets(current, trainingSessionID, (trainingSession) => ({
          ...trainingSession,
          sets: trainingSession.sets.filter((set) => set.id !== setID),
        }))
      );
    } catch (err) {
      setEntryError(trainingSessionID, errorMessage(err));
    } finally {
      setPending((current) => ({ ...current, deletingSetId: null }));
    }
  }

  function toggleTrainingSession(trainingSessionID: ID): void {
    setOpenTrainingSessionId((current) => (current === trainingSessionID ? null : trainingSessionID));
  }

  return {
    trainingSessions,
    loading,
    pending,
    formError,
    entryErrors,
    openTrainingSessionId,
    load,
    createTrainingSession,
    deleteTrainingSession,
    addSet,
    updateSet,
    removeSet,
    toggleTrainingSession,
  };
}
