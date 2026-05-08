import type { ImageAsset, PersistedImageAsset } from './types';

const DB_NAME = 'reference-photo-organizer';
const DB_VERSION = 1;
const IMAGE_STORE = 'images';

export async function openLibraryDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IMAGE_STORE)) {
        db.createObjectStore(IMAGE_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB failed to open.'));
  });
}

export async function loadPersistedImages(): Promise<ImageAsset[]> {
  const db = await openLibraryDb();
  const records = await transaction<PersistedImageAsset[]>(db, 'readonly', (store, resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as PersistedImageAsset[]);
    request.onerror = () => reject(request.error ?? new Error('Could not read image library.'));
  });

  return records
    .sort((a, b) => a.importedAt.localeCompare(b.importedAt))
    .map((record) => ({ ...record, url: URL.createObjectURL(record.blob) }));
}

export async function persistImage(asset: ImageAsset) {
  const db = await openLibraryDb();
  const record: PersistedImageAsset = stripObjectUrl(asset);
  await transaction(db, 'readwrite', (store, resolve, reject) => {
    const request = store.put(record);
    request.onsuccess = () => resolve(undefined);
    request.onerror = () => reject(request.error ?? new Error('Could not persist image.'));
  });
}

export async function persistImages(assets: ImageAsset[]) {
  await Promise.all(assets.map((asset) => persistImage(asset)));
}

export async function clearPersistedImages() {
  const db = await openLibraryDb();
  await transaction(db, 'readwrite', (store, resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve(undefined);
    request.onerror = () => reject(request.error ?? new Error('Could not clear image library.'));
  });
}

function stripObjectUrl(asset: ImageAsset): PersistedImageAsset {
  const { url: ignoredUrl, ...record } = asset;
  void ignoredUrl;
  return record;
}

function transaction<T>(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  run: (
    store: IDBObjectStore,
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: unknown) => void
  ) => void
) {
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(IMAGE_STORE, mode);
    const store = tx.objectStore(IMAGE_STORE);
    run(store, resolve, reject);
  });
}
