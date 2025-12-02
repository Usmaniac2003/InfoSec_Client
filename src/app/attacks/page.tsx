"use client";

import { useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { motion, AnimatePresence } from "framer-motion";

// WebCrypto
const subtle = crypto.subtle;

/* ------------------------------------------------------
   Utility Helpers
------------------------------------------------------ */

async function generateECDH() {
  return subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );
}

async function generateIdentityKey() {
  return subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );
}

async function deriveSecret(priv: CryptoKey, pub: CryptoKey) {
  return subtle.deriveBits({ name: "ECDH", public: pub }, priv, 256);
}

async function importRaw(raw: ArrayBuffer) {
  return subtle.importKey("raw", raw, { name: "ECDH", namedCurve: "P-256" }, true, []);
}

async function signData(data: ArrayBuffer, key: CryptoKey) {
  return subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, data);
}

async function verify(data: ArrayBuffer, sig: ArrayBuffer, key: CryptoKey) {
  return subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, sig, data);
}

function ab2b64(buf: ArrayBuffer) {
  return Buffer.from(new Uint8Array(buf)).toString("base64");
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

/* ------------------------------------------------------
   Animated Node Component (Client / MITM / Server)
------------------------------------------------------ */

function Actor({ title, color }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className={`px-6 py-4 rounded-xl shadow-lg border border-gray-700 bg-gray-800 w-48 text-center`}
      style={{ boxShadow: `0 0 25px ${color}55` }}
    >
      <h2 className="text-xl font-bold" style={{ color }}>
        {title}
      </h2>
    </motion.div>
  );
}

/* ------------------------------------------------------
   ANIMATED ARROW BETWEEN ACTORS
------------------------------------------------------ */

function Arrow({ from, to, color, label }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: from }}
      animate={{ opacity: 1, x: to }}
      transition={{ duration: 1.2 }}
      className="absolute top-1/2 flex flex-col items-center"
    >
      <motion.div
        className="h-1 rounded-full"
        style={{ backgroundColor: color, width: 140 }}
      />
      <motion.div
        className="mt-1 text-sm font-semibold"
        style={{ color }}
      >
        {label}
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------
   Main Page
------------------------------------------------------ */

export default function AttacksPage() {
  const [tab, setTab] = useState<"mitm" | "mitm-signed" | "replay">("mitm");
  const [output, setOutput] = useState("");
  const [visuals, setVisuals] = useState<any[]>([]);
  const [glow, setGlow] = useState<"red" | "green" | null>(null);

  const log = async (msg: string, speed = 15) => {
    for (let c of msg) {
      setOutput((o) => o + c);
      await delay(speed);
    }
    setOutput((o) => o + "\n");
  };

  const reset = () => {
    setOutput("");
    setVisuals([]);
    setGlow(null);
  };

  /* ------------------------------------------------------
     VULNERABLE MITM DEMO
  ------------------------------------------------------ */

  async function runMitmVulnerable() {
    reset();
    await log("=== MITM Attack — VULNERABLE DH ===\n");

    // Add the visual actors
    setVisuals([
      { type: "actors" },
      { type: "arrow", from: -220, to: 10, label: "Public Key", color: "red" },
    ]);

    const C = await generateECDH();
    const S = await generateECDH();
    const M_C = await generateECDH();
    const M_S = await generateECDH();

    const C_pub = await subtle.exportKey("raw", C.publicKey);
    const S_pub = await subtle.exportKey("raw", S.publicKey);
    const M_pub_C = await subtle.exportKey("raw", M_C.publicKey);
    const M_pub_S = await subtle.exportKey("raw", M_S.publicKey);

    await log("🟡 MITM intercepts handshake…");
    await log("🔁 Replacing both public keys with attacker keys…");

    /* Animated arrows showing interception */
    setVisuals([
      { type: "actors" },
      {
        type: "arrow",
        from: -220,
        to: 10,
        label: "Intercepted",
        color: "red",
      },
      {
        type: "arrow",
        from: 220,
        to: -10,
        label: "Fake Key",
        color: "red",
      },
    ]);

    await delay(1200);

    const fakeServerKey = await importRaw(M_pub_S);
    const fakeClientKey = await importRaw(M_pub_C);

    const secretC = await deriveSecret(C.privateKey, fakeServerKey);
    const secretS = await deriveSecret(S.privateKey, fakeClientKey);
    const secretM1 = await deriveSecret(M_C.privateKey, await importRaw(C_pub));
    const secretM2 = await deriveSecret(M_S.privateKey, await importRaw(S_pub));

    await log("\nClient Secret : " + ab2b64(secretC));
    await log("Server Secret : " + ab2b64(secretS));
    await log("\nAttacker ↔ Client: " + ab2b64(secretM1));
    await log("Attacker ↔ Server: " + ab2b64(secretM2));

    setGlow("red");
    await log("\n❌ MITM SUCCESS — Attacker controls the connection.");
  }

  /* ------------------------------------------------------
     SIGNED ECDH MITM DEFENSE
  ------------------------------------------------------ */

  async function runMitmSigned() {
    reset();
    await log("=== MITM Attack — SIGNED ECDH ===\n");

    const C_id = await generateIdentityKey();
    const C = await generateECDH();
    const M = await generateECDH();

    const C_pub = await subtle.exportKey("raw", C.publicKey);
    const M_pub = await subtle.exportKey("raw", M.publicKey);

    const signature = await signData(C_pub, C_id.privateKey);

    await log("🟡 MITM intercepts…");
    await log("⚠ Tries to replace public key…");

    setVisuals([
      { type: "actors" },
      {
        type: "arrow",
        from: -220,
        to: 10,
        label: "Tampered PubKey",
        color: "red",
      },
    ]);

    const ok = await verify(M_pub, signature, C_id.publicKey);

    await log("\nServer verifies signature…");
    await log("Valid? " + ok);

    if (!ok) {
      setGlow("green");
      await log("\n✅ MITM FAILED — Signature mismatch detected.");
    }
  }

  /* ------------------------------------------------------
     REPLAY ATTACK DEMO
  ------------------------------------------------------ */

  async function runReplay() {
    reset();
    await log("=== Replay Attack Demonstration ===\n");

    const msg = {
      nonce: crypto.randomUUID(),
      timestamp: Date.now(),
      data: "Hello!",
    };

    await log("Original message:");
    await log(JSON.stringify(msg, null, 2) + "\n");

    // Vulnerable flow
    await log("1️⃣ Vulnerable Server — accepts replay ❌");

    setVisuals([
      { type: "actors" },
      {
        type: "arrow",
        from: -220,
        to: 10,
        color: "yellow",
        label: "Message Sent",
      },
    ]);

    await delay(1000);
    setVisuals([
      { type: "actors" },
      {
        type: "arrow",
        from: -220,
        to: 10,
        color: "red",
        label: "Replayed",
      },
    ]);

    await log("✔ Server accepts");
    await log("❌ Server accepts again (Replay succeeded)");

    // Protected flow
    await log("\n2️⃣ Secure Server — blocks replay 🛡️\n");

    setVisuals([
      { type: "actors" },
      {
        type: "arrow",
        from: -220,
        to: 10,
        color: "green",
        label: "Valid",
      },
    ]);

    const used = new Set<string>();

    function secureReceive(m: any) {
      if (Date.now() - m.timestamp > 20000) return "❌ Old timestamp";
      if (used.has(m.nonce)) return "❌ Nonce reused";
      used.add(m.nonce);
      return "✔ Accepted";
    }

    await delay(800);
    await log("Secure Server: " + secureReceive(msg));

    setVisuals([
      { type: "actors" },
      {
        type: "arrow",
        from: -220,
        to: 10,
        color: "red",
        label: "Replay Blocked",
      },
    ]);

    await delay(800);
    await log("Secure Server: " + secureReceive(msg));

    setGlow("green");
    await log("\n🎉 Replay attack prevented.");
  }

  /* ------------------------------------------------------
     UI
  ------------------------------------------------------ */

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <Card className="max-w-5xl mx-auto bg-gray-900 border border-gray-800 p-8 shadow-xl relative overflow-hidden">

        {/* Glow Effect */}
        <AnimatePresence>
          {glow === "red" && (
            <motion.div
              className="absolute inset-0 bg-red-600/20 blur-3xl rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
          {glow === "green" && (
            <motion.div
              className="absolute inset-0 bg-green-500/20 blur-3xl rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        <div className="relative z-10">
          <h1 className="text-3-2xl font-bold text-green-400 mb-8">
            ⚔️ Attack Demonstrations — Animated Visualizer
          </h1>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <Button variant={tab === "mitm" ? "primary" : "secondary"} onClick={() => setTab("mitm")}>
              MITM — Vulnerable DH
            </Button>

            <Button variant={tab === "mitm-signed" ? "primary" : "secondary"} onClick={() => setTab("mitm-signed")}>
              MITM — Signed ECDH
            </Button>

            <Button variant={tab === "replay" ? "primary" : "secondary"} onClick={() => setTab("replay")}>
              Replay Attack
            </Button>
          </div>

          {/* Run Demo Button */}
          <Button
            onClick={
              tab === "mitm"
                ? runMitmVulnerable
                : tab === "mitm-signed"
                ? runMitmSigned
                : runReplay
            }
            className="mb-6"
          >
            🚀 Run Demo
          </Button>

          {/* ACTORS / FLOW */}
          <div className="relative flex justify-between items-center mb-6 h-40">
            {/* Client */}
            <Actor title="Client" color="#4ade80" />

            {/* MITM (center) */}
            <Actor title="MITM" color="#f87171" />

            {/* Server */}
            <Actor title="Server" color="#60a5fa" />

            {/* Animated arrows */}
            {visuals.map((v, i) =>
              v.type === "arrow" ? (
                <Arrow
                  key={i}
                  from={v.from}
                  to={v.to}
                  color={v.color}
                  label={v.label}
                />
              ) : null
            )}
          </div>

          {/* OUTPUT CONSOLE */}
          <motion.pre
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/40 p-4 rounded-lg text-sm whitespace-pre-wrap 
                       border border-gray-700 h-[300px] overflow-auto 
                       font-mono text-green-300 shadow-inner"
          >
{output}
          </motion.pre>
        </div>
      </Card>
    </main>
  );
}
