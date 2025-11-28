"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: any | null;
  token: string | null;
  initialized: boolean;
  login: (user: any, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("accessToken");

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedToken) setToken(storedToken);

    setInitialized(true);
  }, []);

  function login(userData: any, token: string) {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", token);

    setUser(userData);
    setToken(token);
  }

  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");

    setUser(null);
    setToken(null);

    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, initialized }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be inside AuthProvider");
  return context;
}
