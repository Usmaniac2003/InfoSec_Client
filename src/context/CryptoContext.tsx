"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// ---------------------------------------------------------
// Types
// ---------------------------------------------------------

interface CryptoContextType {
  sessionKey: CryptoKey | null;
  setSessionKey: (key: CryptoKey) => void;
  clearSessionKey: () => void;
  exportSessionKey: () => Promise<JsonWebKey | null>;
}

const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

// ---------------------------------------------------------
// Provider
// ---------------------------------------------------------

export function CryptoProvider({ children }: { children: ReactNode }) {
  const [sessionKey, setSessionKeyState] = useState<CryptoKey | null>(null);

  // OPTIONAL:
  // Persist session key in IndexedDB or sessionStorage
  // Disabled by default for max security.
  const PERSIST_SESSION_KEY = false;

  // Load persisted key if enabled
  useEffect(() => {
    if (!PERSIST_SESSION_KEY) return;

    const loadPersistedKey = async () => {
      const saved = sessionStorage.getItem("sessionKeyJwk");
      if (!saved) return;

      try {
        const jwk = JSON.parse(saved);
        const imported = await window.crypto.subtle.importKey(
          "jwk",
          jwk,
          { name: "AES-GCM" },
          false,
          ["encrypt", "decrypt"]
        );
        setSessionKeyState(imported);
      } catch (err) {
        console.warn("Failed to load persisted session key:", err);
      }
    };

    loadPersistedKey();
  }, []);

  // Save session key if persistence enabled
  const setSessionKey = (key: CryptoKey) => {
    setSessionKeyState(key);

    if (PERSIST_SESSION_KEY) {
      window.crypto.subtle
        .exportKey("jwk", key)
        .then((jwk) => sessionStorage.setItem("sessionKeyJwk", JSON.stringify(jwk)))
        .catch((err) => console.warn("Failed to persist session key:", err));
    }
  };

  const clearSessionKey = () => {
    setSessionKeyState(null);
    if (PERSIST_SESSION_KEY) {
      sessionStorage.removeItem("sessionKeyJwk");
    }
  };

  const exportSessionKey = async () => {
    if (!sessionKey) return null;
    return window.crypto.subtle.exportKey("jwk", sessionKey);
  };

  return (
    <CryptoContext.Provider
      value={{
        sessionKey,
        setSessionKey,
        clearSessionKey,
        exportSessionKey,
      }}
    >
      {children}
    </CryptoContext.Provider>
  );
}

// ---------------------------------------------------------
// Hook
// ---------------------------------------------------------

export function useCryptoContext(): CryptoContextType {
  const ctx = useContext(CryptoContext);
  if (!ctx) {
    throw new Error("useCryptoContext must be used inside <CryptoProvider>");
  }
  return ctx;
}
