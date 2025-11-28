"use client";

import { useEffect, useState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();

  // global auth state
  const { token, initialized } = useAuthContext();

  // API actions (register)
  const { register } = useAuth();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  // 🚫 Prevent logged-in users from reaching /register
  useEffect(() => {
    if (!initialized) return;
    if (token) {
      router.replace("/chat");
    }
  }, [initialized, token, router]);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      await register(form);
      // register() handles redirect → /secure-session
    } catch (err: any) {
      setErrorMsg("Registration failed. Try another email.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-1">
          Create an Account ✨
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="First Name"
            required
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />

          <Input
            label="Last Name"
            required
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />

          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Input
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

          <Button loading={loading} className="w-full">
            Register
          </Button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-4">
          Already have an account?
          <Link href="/login" className="text-blue-600 ml-1 underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
