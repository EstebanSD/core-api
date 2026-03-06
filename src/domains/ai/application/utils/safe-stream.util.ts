export async function* safeStream<T>(
  stream: AsyncIterable<T>,
  onError: (error: unknown) => Error,
): AsyncIterable<T> {
  try {
    yield* stream;
  } catch (error) {
    throw onError(error);
  }
}
