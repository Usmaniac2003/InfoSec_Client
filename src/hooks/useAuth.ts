"use client";

import { useAuthContext } from "@/context/AuthContext";
import api from "@/lib/api/api";
import { API_ROUTES } from "@/lib/api/routes";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();
  const { login: contextLogin, logout: contextLogout } = useAuthContext();

  async function login(email: string, password: string) {
    const res = await api.post(API_ROUTES.auth.login, { email, password });
    const { accessToken, user } = res.data;

    // Store in AuthContext (this also stores in localStorage)
    contextLogin(user, accessToken);

  }

  async function register(data: any) {
    const res = await api.post(API_ROUTES.auth.register, data);
    const { accessToken, user } = res.data;

    // Store in AuthContext
    contextLogin(user, accessToken);

    router.push("/secure-session");
  }

  function logout() {
    contextLogout();
  }

  return { login, register, logout: contextLogout };
}
