// src/lib/indexeddb.ts

import { IdentityKeyPair, IdentityKeyMetadata } from './crypto/keys';

const DB_NAME = 'secure-messenger';
const DB_VERSION = 1;
const STORE_KEYS = 'keys';

type StoredIdentityKeyRecord = {
  meta: IdentityKeyMetadata;
  publicKey: CryptoKey;
  privateKey: CryptoKey;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('IndexedDB is not available on the server.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_KEYS)) {
        // Keyed by meta.id (e.g. "user:1:identity")
        db.createObjectStore(STORE_KEYS, { keyPath: 'meta.id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveIdentityKeyPair(
  record: StoredIdentityKeyRecord
): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_KEYS, 'readwrite');
    const store = tx.objectStore(STORE_KEYS);
    const request = store.put(record);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    tx.oncomplete = () => db.close();
  });
}

export async function loadIdentityKeyPair(
  id: string
): Promise<StoredIdentityKeyRecord | null> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_KEYS, 'readonly');
    const store = tx.objectStore(STORE_KEYS);
    const request = store.get(id);

    request.onsuccess = () => {
      const result = request.result as StoredIdentityKeyRecord | undefined;
      resolve(result ?? null);
      db.close();
    };

    request.onerror = () => {
      reject(request.error);
      db.close();
    };
  });
}

export type { StoredIdentityKeyRecord };
