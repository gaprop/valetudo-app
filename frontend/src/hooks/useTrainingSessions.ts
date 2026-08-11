import { useCallback, useEffect, useState } from "react";
import { errorMessage } from "../api";
import { trainingSessionsService } from "../services";
import { sortTrainingSets, sortTrainingSessions } from "../sorting";
import { runAsyncAction } from "./asyncAction";
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
    await runAsyncAction({
      before: () => {
        setLoading(true);
        setFormError("");
      },
      action: async () => {
        setTrainingSessions(sortTrainingSessions(await trainingSessionsService.list()));
      },
      onError: (error) => setFormError(errorMessage(error)),
      after: () => setLoading(false),
      fallback: undefined,
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createTrainingSession(input: CreateTrainingSessionRequest): Promise<boolean> {
    return runAsyncAction({
      before: () => {
        setPending((current) => ({ ...current, savingEntry: true }));
        setFormError("");
      },
      action: async () => {
        const trainingSession = await trainingSessionsService.create(input);
        setTrainingSessions((current) =>
          sortTrainingSessions([trainingSession, ...current])
        );
        setOpenTrainingSessionId(trainingSession.id);
        return true;
      },
      onError: (error) => setFormError(errorMessage(error)),
      after: () => setPending((current) => ({ ...current, savingEntry: false })),
      fallback: false,
    });
  }

  async function deleteTrainingSession(trainingSessionID: ID): Promise<void> {
    await runAsyncAction({
      before: () => {
        setPending((current) => ({
          ...current,
          deletingTrainingSessionId: trainingSessionID,
        }));
        clearEntryError(trainingSessionID);
      },
      action: async () => {
        await trainingSessionsService.delete({ trainingSessionID });
        setTrainingSessions((current) =>
          current.filter(
            (trainingSession) => trainingSession.id !== trainingSessionID
          )
        );
        setOpenTrainingSessionId((current) =>
          current === trainingSessionID ? null : current
        );
      },
      onError: (error) => setEntryError(trainingSessionID, errorMessage(error)),
      after: () =>
        setPending((current) => ({ ...current, deletingTrainingSessionId: null })),
      fallback: undefined,
    });
  }

  async function addSet(input: CreateTrainingSetRequest): Promise<boolean> {
    return runAsyncAction({
      before: () => {
        setPending((current) => ({
          ...current,
          savingSetId: input.trainingSessionID,
        }));
        clearEntryError(input.trainingSessionID);
      },
      action: async () => {
        const trainingSet = await trainingSessionsService.addSet(input);
        setTrainingSessions((current) =>
          updateTrainingSessionSets(
            current,
            input.trainingSessionID,
            (trainingSession) => ({
              ...trainingSession,
              sets: sortTrainingSets([...trainingSession.sets, trainingSet]),
            })
          )
        );
        return true;
      },
      onError: (error) =>
        setEntryError(input.trainingSessionID, errorMessage(error)),
      after: () => setPending((current) => ({ ...current, savingSetId: null })),
      fallback: false,
    });
  }

  async function updateSet(input: UpdateTrainingSetRequest): Promise<void> {
    await runAsyncAction({
      before: () => {
        setPending((current) => ({ ...current, updatingSetId: input.setID }));
        clearEntryError(input.trainingSessionID);
      },
      action: async () => {
        const trainingSet = await trainingSessionsService.updateSet(input);
        setTrainingSessions((current) =>
          updateTrainingSessionSets(
            current,
            input.trainingSessionID,
            (trainingSession) => ({
              ...trainingSession,
              sets: trainingSession.sets.map((set) =>
                set.id === input.setID ? trainingSet : set
              ),
            })
          )
        );
      },
      onError: (error) =>
        setEntryError(input.trainingSessionID, errorMessage(error)),
      after: () => setPending((current) => ({ ...current, updatingSetId: null })),
      fallback: undefined,
    });
  }

  async function removeSet(trainingSessionID: ID, setID: ID): Promise<void> {
    await runAsyncAction({
      before: () => {
        setPending((current) => ({ ...current, deletingSetId: setID }));
        clearEntryError(trainingSessionID);
      },
      action: async () => {
        await trainingSessionsService.deleteSet({ trainingSessionID, setID });
        setTrainingSessions((current) =>
          updateTrainingSessionSets(current, trainingSessionID, (trainingSession) => ({
            ...trainingSession,
            sets: trainingSession.sets.filter((set) => set.id !== setID),
          }))
        );
      },
      onError: (error) => setEntryError(trainingSessionID, errorMessage(error)),
      after: () => setPending((current) => ({ ...current, deletingSetId: null })),
      fallback: undefined,
    });
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
