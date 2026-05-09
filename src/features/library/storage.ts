import { createDefaultWorkspaceMeta } from '../workspace/defaults';
import type { WorkspaceMeta } from '../workspace/types';
import type { ImageAsset, PersistedImageAsset } from './types';

const DB_NAME = 'reference-photo-organizer';
const DB_VERSION = 2;
const IMAGE_STORE = 'images';
const META_STORE = 'workspace_meta';
const META_KEY = 'workspace-meta';

interface WorkspaceMetaRecord {
  key: string;
  value: WorkspaceMeta;
}

async function openLibraryDb(): Promise<IDBDatabase> {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IMAGE_STORE)) {
        db.createObjectStore(IMAGE_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB failed to open.'));
  });
}

export async function loadPersistedImages(): Promise<ImageAsset[]> {
  const db = await openLibraryDb();
  const records = await transaction<PersistedImageAsset[]>(
    db,
    'readonly',
    IMAGE_STORE,
    (store, resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as PersistedImageAsset[]);
      request.onerror = () => reject(request.error ?? new Error('Could not read image library.'));
    }
  );

  return records
    .sort((a, b) => a.importedAt.localeCompare(b.importedAt))
    .map((record) => ({ ...record, url: URL.createObjectURL(record.blob) }));
}

export async function persistImage(asset: ImageAsset) {
  const db = await openLibraryDb();
  const record: PersistedImageAsset = stripObjectUrl(asset);
  await transaction(db, 'readwrite', IMAGE_STORE, (store, resolve, reject) => {
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
  await transaction(db, 'readwrite', IMAGE_STORE, (store, resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve(undefined);
    request.onerror = () => reject(request.error ?? new Error('Could not clear image library.'));
  });
}

export async function loadWorkspaceMeta(): Promise<WorkspaceMeta> {
  const db = await openLibraryDb();
  const record = await transaction<WorkspaceMetaRecord | null>(
    db,
    'readonly',
    META_STORE,
    (store, resolve, reject) => {
      const request = store.get(META_KEY);
      request.onsuccess = () => resolve((request.result as WorkspaceMetaRecord | undefined) ?? null);
      request.onerror = () => reject(request.error ?? new Error('Could not read workspace settings.'));
    }
  );

  return record?.value ?? createDefaultWorkspaceMeta();
}

export async function persistWorkspaceMeta(meta: WorkspaceMeta) {
  const db = await openLibraryDb();
  await transaction(db, 'readwrite', META_STORE, (store, resolve, reject) => {
    const request = store.put({ key: META_KEY, value: meta });
    request.onsuccess = () => resolve(undefined);
    request.onerror = () => reject(request.error ?? new Error('Could not persist workspace settings.'));
  });
}

export async function clearPersistedWorkspace() {
  const db = await openLibraryDb();
  await transaction(db, 'readwrite', META_STORE, (store, resolve, reject) => {
    const request = store.delete(META_KEY);
    request.onsuccess = () => resolve(undefined);
    request.onerror = () => reject(request.error ?? new Error('Could not clear workspace settings.'));
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
  storeName: string,
  run: (
    store: IDBObjectStore,
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: unknown) => void
  ) => void
) {
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    run(store, resolve, reject);
  });
}
