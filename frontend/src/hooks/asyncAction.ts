type AsyncActionOptions<T> = {
  before?: () => void;
  action: () => Promise<T>;
  onError: (error: unknown) => void;
  after?: () => void;
  fallback: T;
};

export async function runAsyncAction<T>({
  before,
  action,
  onError,
  after,
  fallback,
}: AsyncActionOptions<T>): Promise<T> {
  before?.();
  try {
    return await action();
  } catch (error) {
    onError(error);
    return fallback;
  } finally {
    after?.();
  }
}
