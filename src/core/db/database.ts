/** Thin promise-based wrapper over IndexedDB. Knows nothing about the app's data. */

export interface IndexConfig {
  name: string;
  keyPath: string | string[];
  unique?: boolean;
}

export interface ObjectStoreConfig {
  name: string;
  keyPath: string;
  indexes?: IndexConfig[];
}

export interface DatabaseConfig {
  name: string;
  /** Bump when `stores` change; missing stores and indexes are created on upgrade. */
  version: number;
  stores: ObjectStoreConfig[];
}

export function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new DOMException('Transaction aborted', 'AbortError'));
  });
}

export function openDatabase(config: DatabaseConfig): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB is not available'));

  const request = indexedDB.open(config.name, config.version);
  request.onupgradeneeded = () => {
    const db = request.result;
    const tx = request.transaction!;
    for (const storeConfig of config.stores) {
      const store = db.objectStoreNames.contains(storeConfig.name)
        ? tx.objectStore(storeConfig.name)
        : db.createObjectStore(storeConfig.name, { keyPath: storeConfig.keyPath });
      for (const index of storeConfig.indexes ?? []) {
        if (!store.indexNames.contains(index.name)) {
          store.createIndex(index.name, index.keyPath, { unique: index.unique ?? false });
        }
      }
    }
  };

  return requestToPromise(request).then((db) => {
    // Let a newer version in another tab upgrade instead of being blocked forever.
    db.onversionchange = () => db.close();
    return db;
  });
}

/** Opens the database on first use and reuses the connection afterwards. */
export function lazyDatabase(config: DatabaseConfig): () => Promise<IDBDatabase> {
  let db: Promise<IDBDatabase> | null = null;
  return () => {
    db ??= openDatabase(config).catch((error) => {
      db = null; // allow a retry
      throw error;
    });
    return db;
  };
}
