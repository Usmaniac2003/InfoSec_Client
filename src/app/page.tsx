"use client";

import Link from "next/link";
import Button from "@/components/Button";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, MessageCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white">
      {/* Header */}
      <header className="w-full flex justify-between items-center p-4 md:p-6 z-20">
        <Link href="/" className="font-bold text-lg md:text-xl">
          SecureChat
        </Link>

        <motion.div
          className="flex gap-2 md:gap-4 items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Auth Buttons */}
          <Link href="/login" className="hidden xs:block">
            <Button variant="secondary" className="text-sm md:text-base px-3 md:px-5">
              Login
            </Button>
          </Link>
          <Link href="/login" className="xs:hidden">
            <Button
              variant="secondary"
              className="p-2 rounded-full flex items-center justify-center"
            >
              <Lock className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/register" className="w-full xs:w-auto">
            <Button className="text-sm md:text-base w-full xs:w-auto px-4 md:px-6">
              Get Started
            </Button>
          </Link>
        </motion.div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 md:px-12 z-10">
        <motion.h2
          className="text-3xl md:text-6xl font-extrabold mb-6 drop-shadow-md max-w-3xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Secure. Private. End-to-End Encrypted.
        </motion.h2>

        <motion.p
          className="max-w-2xl text-sm md:text-lg opacity-80 mb-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Experience the safest way to communicate — featuring encrypted file
          transfers, authenticated sessions, and privacy-first architecture.
        </motion.p>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <Link href="/register">
            <Button className="px-8 md:px-12 py-3 md:py-4 text-lg shadow-lg hover:shadow-xl hover:scale-[1.07] transition-transform">
              Start Messaging
            </Button>
          </Link>
        </motion.div>

        {/* Icons Row */}
        <motion.div
          className="flex gap-8 mt-12 opacity-70"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <ShieldCheck className="w-8 h-8 md:w-10 md:h-10" />
          <MessageCircle className="w-8 h-8 md:w-10 md:h-10" />
        </motion.div>

        <motion.p
          className="mt-6 text-xs md:text-sm opacity-60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Zero tracking • Zero metadata storage • Pure encryption
        </motion.p>
      </section>
    </main>
  );
}