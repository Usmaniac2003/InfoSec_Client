"use client";

import Link from "next/link";
import Button from "@/components/Button";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {/* Navbar */}
      <header className="w-full py-4 px-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">CipherChat 🔐</h1>

        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="secondary">Login</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center text-center px-8">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Secure. Private. End-to-End Encrypted.
        </h2>

        <p className="text-gray-600 text-lg max-w-xl mb-8">
          Welcome to CipherChat — a modern encrypted messaging app built with 
          full end-to-end encryption, secure key exchange, and encrypted file 
          sharing. Your privacy is our priority.
        </p>

        <Link href="/register">
          <Button className="px-8 py-3 text-lg">Start Messaging</Button>
        </Link>

        <p className="mt-6 text-gray-500 text-sm">
          No data stored. No tracking. 100% encrypted.
        </p>
      </section>
    </main>
  );
}
