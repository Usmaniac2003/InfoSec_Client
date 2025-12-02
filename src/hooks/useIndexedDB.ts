"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import {
  generateIdentityKeyPair,
  IdentityKeyAlgorithm,
  IdentityKeyPair,
} from "@/lib/crypto/keys";
import {
  loadIdentityKeyPair,
  saveIdentityKeyPair,
  StoredIdentityKeyRecord,
} from "@/lib/indexeddb";

type UseIdentityKeysState = {
  loading: boolean;
  error: string | null;
  keys: IdentityKeyPair | null;
};

export function useIdentityKeys(
  algorithm: IdentityKeyAlgorithm = "EC"
): UseIdentityKeysState & {
  ensureKeys: () => Promise<IdentityKeyPair | null>;
  refresh: () => Promise<void>;
} {
  const { user } = useAuthContext();
  const keyId = user ? `user:${user.id}:identity` : null;

  const [state, setState] = useState<UseIdentityKeysState>({
    loading: false,
    error: null,
    keys: null,
  });

  // Load existing keys from DB
  const loadFromDb = useCallback(async () => {
    if (!keyId) {
      setState({ loading: false, error: null, keys: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const record = await loadIdentityKeyPair(keyId);
      if (!record) {
        setState({ loading: false, error: null, keys: null });
        return;
      }

      const keys: IdentityKeyPair = {
        meta: record.meta,
        publicKey: record.publicKey,
        privateKey: record.privateKey,
      };

      setState({ loading: false, error: null, keys });
    } catch (err: any) {
      setState({
        loading: false,
        error: err?.message ?? "Failed to load identity keys.",
        keys: null,
      });
    }
  }, [keyId]);

  // FIXED: ensureKeys must return IdentityKeyPair | null
  const ensureKeys = useCallback(async (): Promise<IdentityKeyPair | null> => {
    if (!keyId) return null;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const existing = await loadIdentityKeyPair(keyId);
      if (existing) {
        const keys: IdentityKeyPair = {
          meta: existing.meta,
          publicKey: existing.publicKey,
          privateKey: existing.privateKey,
        };
        setState({ loading: false, error: null, keys });
        return keys; // FIXED
      }

      // Generate new identity keypair
      const generated = await generateIdentityKeyPair(keyId, algorithm);

      const record: StoredIdentityKeyRecord = {
        meta: generated.meta,
        publicKey: generated.publicKey,
        privateKey: generated.privateKey,
      };

      await saveIdentityKeyPair(record);

      setState({ loading: false, error: null, keys: generated });
      return generated; // FIXED
    } catch (err: any) {
      setState({
        loading: false,
        error: err?.message ?? "Failed to generate identity keys.",
        keys: null,
      });
      return null; // FIXED
    }
  }, [algorithm, keyId]);

  const refresh = useCallback(async () => {
    await loadFromDb();
  }, [loadFromDb]);

  useEffect(() => {
    if (!keyId) {
      setState({ loading: false, error: null, keys: null });
      return;
    }
    loadFromDb();
  }, [keyId, loadFromDb]);

  return {
    ...state,
    ensureKeys,
    refresh,
  };
}
