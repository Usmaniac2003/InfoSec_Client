"use client";

import { useState, useEffect } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();

  // READ global auth state
  const { token, initialized } = useAuthContext();

  // DO login API request
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect already-logged-in users
  useEffect(() => {
    if (!initialized) return;
    if (token) router.replace("/chat");
  }, [initialized, token, router]);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      // login() handles redirect automatically
    } catch (error: any) {
      setErrorMsg("Invalid email or password.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4">Welcome Back 👋</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {errorMsg && <p className="text-red-600">{errorMsg}</p>}

          <Button loading={loading} className="w-full">
            Login
          </Button>
        </form>

        <p className="text-sm mt-4">
          No account?{" "}
          <Link href="/register" className="text-blue-600 underline">
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
}
