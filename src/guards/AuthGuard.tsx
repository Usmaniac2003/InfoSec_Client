"use client";

import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, initialized } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    if (!token) {
      router.replace("/login");
    }
  }, [initialized, token, router]);

  if (!initialized) return null; // or loading spinner

  if (!token) return null;

  return <>{children}</>;
}
