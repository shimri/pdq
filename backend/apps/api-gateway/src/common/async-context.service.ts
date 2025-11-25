import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

interface AsyncContextData {
  correlationId?: string;
}

@Injectable()
export class AsyncContextService {
  private static asyncLocalStorage = new AsyncLocalStorage<AsyncContextData>();

  run<T>(correlationId: string, callback: () => T): T {
    return AsyncContextService.asyncLocalStorage.run({ correlationId }, callback);
  }

  setCorrelationId(correlationId: string): void {
    const store = AsyncContextService.asyncLocalStorage.getStore();
    if (store) {
      store.correlationId = correlationId;
    }
  }

  getCorrelationId(): string | undefined {
    const store = AsyncContextService.asyncLocalStorage.getStore();
    return store?.correlationId;
  }
}

