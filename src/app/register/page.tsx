"use client";

import { useEffect, useState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Lock, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { token, initialized } = useAuthContext();
  const { register } = useAuth();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!initialized) return;
    if (token) router.replace("/chat");
  }, [initialized, token, router]);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      await register(form);
    } catch {
      setErrorMsg("Registration failed. Try another email.");
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-950 transition-colors duration-300">
      {/* Background Animated Blobs */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 bg-blue-700 opacity-30 rounded-full blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
        transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 right-0 w-96 h-96 bg-green-600 opacity-30 rounded-full blur-3xl"
        animate={{ x: [0, -60, 0], y: [0, 60, 0] }}
        transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md backdrop-blur-xl bg-gray-800/70 rounded-2xl shadow-2xl p-8 z-10 border border-gray-700"
      >
        <div className="flex justify-center mb-4">
          <User className="w-10 h-10 text-green-400" />
        </div>

        <h1 className="text-2xl font-bold text-center mb-6 text-white">
          Create an Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="First Name"
            required
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className="bg-gray-700 text-white border-gray-600 rounded-xl"
          />

          <Input
            placeholder="Last Name"
            required
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            className="bg-gray-700 text-white border-gray-600 rounded-xl"
          />

          <Input
            placeholder="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="bg-gray-700 text-white border-gray-600 rounded-xl"
          />

          <Input
            placeholder="Password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="bg-gray-700 text-white border-gray-600 rounded-xl"
          />

          {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

          <Button loading={loading} className="w-full shadow-md hover:shadow-xl transition">
            Register
          </Button>
        </form>

        <p className="text-sm mt-6 text-center text-white opacity-80">
          Already have an account?
          <Link href="/login" className="text-green-400 font-medium hover:underline ml-1">
            Login
          </Link>
        </p>
      </motion.div>
    </main>
  );
}