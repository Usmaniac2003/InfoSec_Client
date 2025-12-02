"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

interface CryptoContextType {
  sessionKey: CryptoKey | null;
  groupKey: CryptoKey | null;

  setSessionKey: (key: CryptoKey) => void;
  setGroupKey: (key: CryptoKey) => void;

  clearSessionKey: () => void;
}

const CryptoContext = createContext<CryptoContextType | undefined>(
  undefined
);

export function CryptoProvider({ children }: { children: ReactNode }) {
  const [sessionKey, setSessionKeyState] = useState<CryptoKey | null>(null);
  const [groupKey, setGroupKeyState] = useState<CryptoKey | null>(null);

  return (
    <CryptoContext.Provider
      value={{
        sessionKey,
        groupKey,
        setSessionKey: setSessionKeyState,
        setGroupKey: setGroupKeyState,
        clearSessionKey: () => {
          setSessionKeyState(null);
          setGroupKeyState(null);
        },
      }}
    >
      {children}
    </CryptoContext.Provider>
  );
}

export function useCryptoContext() {
  const ctx = useContext(CryptoContext);
  if (!ctx)
    throw new Error("useCryptoContext must be used inside <CryptoProvider>");
  return ctx;
}
