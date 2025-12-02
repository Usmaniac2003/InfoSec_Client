"use client";

import { useState, useEffect } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { token, initialized } = useAuthContext();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    if (token) router.replace("/chat");
  }, [initialized, token, router]);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      router.push("/secure-session");
    } catch {
      setErrorMsg("Invalid email or password.");
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
          <Lock className="w-10 h-10 text-green-400" />
        </div>

        <h1 className="text-2xl font-bold text-center mb-6 text-white">
          Welcome Back
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-700 text-white border-gray-600 rounded-xl"
          />

          <div className="relative">
            <Input
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-700 text-white border-gray-600 rounded-xl"
            />

            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

          <Button
            loading={loading}
            className="w-full shadow-md hover:shadow-xl transition"
          >
            Login
          </Button>
        </form>

        <p className="text-sm mt-6 text-center text-white opacity-80">
          No account?
          <Link
            href="/register"
            className="text-green-400 font-medium hover:underline ml-1"
          >
            Register
          </Link>
        </p>
      </motion.div>
    </main>
  );
}