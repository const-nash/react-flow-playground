import { z } from 'zod';
import { requestToPromise, transactionDone } from './database';

/** Storage-agnostic collection of records keyed by `id`. */
export interface Repository<T extends { id: string }> {
  getAll(): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  put(item: T): Promise<void>;
  delete(id: string): Promise<void>;
}

interface RepositoryOptions<T> {
  /** Every record is parsed on read and write: invalid data never leaves or enters storage. */
  schema: z.ZodType<T>;
  /** Called for stored records that no longer match the schema; they are skipped. */
  onInvalidRecord?: (record: unknown, error: z.ZodError) => void;
}

const defaultOnInvalid = (record: unknown, error: z.ZodError) =>
  console.warn('Skipping invalid stored record', record, z.prettifyError(error));

export function createIndexedDbRepository<T extends { id: string }>(
  getDb: () => Promise<IDBDatabase>,
  storeName: string,
  { schema, onInvalidRecord = defaultOnInvalid }: RepositoryOptions<T>,
): Repository<T> {
  const parseStored = (record: unknown): T | undefined => {
    const result = schema.safeParse(record);
    if (result.success) return result.data;
    onInvalidRecord(record, result.error);
    return undefined;
  };

  const withStore = async <R>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<R>) => {
    const tx = (await getDb()).transaction(storeName, mode);
    const [result] = await Promise.all([requestToPromise(run(tx.objectStore(storeName))), transactionDone(tx)]);
    return result;
  };

  return {
    async getAll() {
      const records = await withStore('readonly', (store) => store.getAll());
      return records.map(parseStored).filter((r): r is T => r !== undefined);
    },
    async get(id) {
      const record = await withStore('readonly', (store) => store.get(id));
      return record === undefined ? undefined : parseStored(record);
    },
    async put(item) {
      const valid = schema.parse(item);
      await withStore('readwrite', (store) => store.put(valid));
    },
    async delete(id) {
      await withStore('readwrite', (store) => store.delete(id));
    },
  };
}

/** In-memory implementation with the same contract — for tests and environments without IndexedDB. */
export function createMemoryRepository<T extends { id: string }>({ schema }: RepositoryOptions<T>): Repository<T> {
  const records = new Map<string, T>();
  const clone = (item: T) => structuredClone(item);
  return {
    getAll: async () => [...records.values()].map(clone),
    get: async (id) => {
      const item = records.get(id);
      return item && clone(item);
    },
    put: async (item) => void records.set(item.id, clone(schema.parse(item))),
    delete: async (id) => void records.delete(id),
  };
}
