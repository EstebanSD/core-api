import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { AIStreamChunk } from '../../domain/ai-response';

export function streamToObservable(stream: AsyncIterable<AIStreamChunk>): Observable<MessageEvent> {
  return new Observable((subscriber) => {
    void (async () => {
      try {
        for await (const chunk of stream) {
          subscriber.next({
            type: chunk.done ? 'done' : 'delta',
            data: chunk,
          });
        }

        subscriber.complete();
      } catch (error) {
        subscriber.error(error);
      }
    })();
  });
}
