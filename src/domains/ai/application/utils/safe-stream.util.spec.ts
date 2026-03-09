/* eslint-disable require-yield */
/* eslint-disable @typescript-eslint/require-await */
import { safeStream } from './safe-stream.util';

async function collectStream<T>(stream: AsyncIterable<T>): Promise<T[]> {
  const result: T[] = [];

  for await (const chunk of stream) {
    result.push(chunk);
  }

  return result;
}

describe('safeStream', () => {
  it('should yield all chunks from the stream', async () => {
    async function* mockStream() {
      yield 1;
      yield 2;
      yield 3;
    }

    const stream = safeStream(mockStream(), (err) => new Error(String(err)));

    const result = await collectStream(stream);

    expect(result).toEqual([1, 2, 3]);
  });

  it('should transform errors using onError', async () => {
    async function* failingStream() {
      yield 1;
      throw new Error('boom');
    }

    const stream = safeStream(failingStream(), () => new Error('mapped error'));

    await expect(collectStream(stream)).rejects.toThrow('mapped error');
  });

  it('should pass original error to onError', async () => {
    const original = new Error('original');

    async function* failingStream() {
      throw original;
    }

    const stream = safeStream(
      failingStream(),
      (err) => new Error(`mapped: ${(err as Error).message}`),
    );

    await expect(collectStream(stream)).rejects.toThrow('mapped: original');
  });
});
