"use client";

import { useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";

export default function AttackDemoPage() {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string[]>([]);

  function log(msg: string) {
    setOutput((prev) => [...prev, msg]);
  }

  async function simulateMITM() {
    setLoading(true);
    setOutput([]);

    log("Starting MITM attack on insecure Diffie-Hellman...");
    await wait();

    log("Intercepting client public key...");
    await wait();

    log("Replacing with attacker’s forged DH public key...");
    await wait();

    log("Client derives attacker-controlled shared secret...");
    await wait();

    log("Server also derives attacker-controlled shared secret...");
    await wait();

    log("MITM Successful ❌ — without digital signatures, DH is vulnerable.");
    setLoading(false);
  }

  async function simulateReplay() {
    setLoading(true);
    setOutput([]);

    log("Sending valid encrypted message...");
    await wait();

    log("Capturing ciphertext + IV...");
    await wait();

    log("Replaying same ciphertext...");
    await wait();

    log("Server detects replay (duplicate nonce/sequence number) and rejects it ✔");
    setLoading(false);
  }

  function wait(ms = 700) {
    return new Promise((res) => setTimeout(res, ms));
  }

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Attack Demonstration 🔥
      </h1>

      <Card className="w-full max-w-3xl mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          MITM Attack Simulation
        </h2>

        <p className="text-gray-600 mb-4">
          Demonstrates how an attacker can intercept and manipulate an insecure
          Diffie-Hellman key exchange (without signatures).
        </p>

        <Button onClick={simulateMITM} loading={loading}>
          Run MITM Attack
        </Button>
      </Card>

      <Card className="w-full max-w-3xl mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Replay Attack Simulation
        </h2>

        <p className="text-gray-600 mb-4">
          Simulates a replay attack by sending the same encrypted message twice.
          Server should reject the second message using nonces & sequence numbers.
        </p>

        <Button onClick={simulateReplay} loading={loading}>
          Run Replay Attack
        </Button>
      </Card>

      <Card className="w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Output Log</h2>

        <div className="bg-gray-100 p-4 rounded-md h-64 overflow-y-auto text-sm text-gray-700">
          {loading && <Spinner />}

          {output.length === 0 && !loading && (
            <p className="text-gray-400">Output will appear here...</p>
          )}

          {output.map((line, i) => (
            <p key={i} className="mb-1">• {line}</p>
          ))}
        </div>
      </Card>
    </div>
  );
}
