"use client";

import { useState, useEffect } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { useRouter } from "next/navigation";
import AuthGuard from "@/guards/AuthGuard";
import { useIdentityKeys } from "@/hooks/useIndexedDB";
import { useCryptoContext } from "@/context/CryptoContext";
import { useKeyExchange } from "@/hooks/useKeyExchange";
import { deriveSharedSecret } from "@/lib/crypto/dh";
import { hkdfDeriveAES256Key } from "@/lib/crypto/hashing";
import { MITM } from "@/lib/FLAG";

export default function SecureSessionPage() {
  const router = useRouter();
  const cryptoContext = useCryptoContext();
  const { initiate, confirm, initiateVulnerable } = useKeyExchange();
  const { ensureKeys: ensureIdentityKeys } = useIdentityKeys("EC");

  const [step, setStep] = useState("idle");
  const [message, setMessage] = useState("Preparing secure session...");

  // ⭐ NEW FLAG — Turn MITM protection ON/OFF
  const [mitmProtection, setMitmProtection] = useState(MITM);

  useEffect(() => {
    runHandshake();
  }, [mitmProtection]); // rerun when toggled

  async function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function runHandshake() {
    try {
      //
      // STEP 0 — Load Identity Keys
      //
      setStep("loading-identity");
      setMessage("🔑 Loading your identity keys...");
      await wait(600);

      const identity = await ensureIdentityKeys();
      if (!identity) throw new Error("No identity keys");

      //
      // STEP 1 — Initiate handshake
      //
      setStep("initiating");
      setMessage(
        mitmProtection
          ? "📡 Starting **secure** handshake (MITM-Protected)..."
          : "⚠️ Starting **vulnerable** handshake (MITM Possible)..."
      );
      await wait(900);

      let eph, serverResp, handshakeId;
      let isSecure = mitmProtection;

      if (isSecure) {
        // SECURE SIGNED HANDSHAKE
        const secure = await initiate(identity);
        eph = secure.eph;
        serverResp = secure.serverResp;
        handshakeId = serverResp.handshakeId;
      } else {
        // VULNERABLE UNSIGNED HANDSHAKE
        const insecure = await initiateVulnerable();
        eph = insecure.eph;
        serverResp = insecure.serverResp;
        handshakeId = null; // ❌ Not provided in vulnerable mode
      }

      //
      // STEP 2 — Derive ECDH Shared Secret
      //
      setStep("deriving");
      setMessage("🧮 Deriving shared ECDH secret...");
      await wait(700);

      const serverPub = await crypto.subtle.importKey(
        "raw",
        base64ToBuf(serverResp.serverEphemeralKey),
        { name: "ECDH", namedCurve: "P-256" },
        true,
        []
      );

      const sharedSecret = await deriveSharedSecret(eph.privateKey, serverPub);
      const sessionKey = await hkdfDeriveAES256Key(sharedSecret);
      cryptoContext.setSessionKey(sessionKey);

      //
      // IF NOT SECURE — STOP HERE
      //
      if (!isSecure) {
        setStep("done");
        setMessage("⚠️ Vulnerable session active. MITM possible. Redirecting...");
        await wait(1000);
        router.push("/chat");
        return;
      }

      //
      // SECURE MODE CONTINUES
      //

      // STEP 3 — Confirm handshake
      setStep("confirming");
      setMessage("🔐 Confirming secure session...");
      await wait(700);

      const confirmRes = await confirm(sessionKey, handshakeId);

      //
      // STEP 4 — Decrypt group key
      //
      setStep("decrypting-group-key");
      setMessage("🗝️ Decrypting group key...");
      await wait(700);

      const encrypted = base64ToBuf(confirmRes.encryptedGroupKey);
      const iv = base64ToBuf(confirmRes.groupIv);

      const rawGroupKey = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        sessionKey,
        encrypted
      );

      const groupKey = await crypto.subtle.importKey(
        "raw",
        rawGroupKey,
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"]
      );

      cryptoContext.setGroupKey(groupKey);

      //
      // STEP 5 — Done
      //
      setStep("done");
      setMessage("✅ Secure MITM-protected session established!");
      await wait(1000);

      router.push("/chat");

    } catch (err) {
      console.error(err);
      setStep("idle");
      setMessage("❌ Error establishing session. Please retry.");
    }
  }

  function base64ToBuf(b64: string): ArrayBuffer {
    return Uint8Array.from(Buffer.from(b64, "base64")).buffer;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black px-4">
        <Card className="w-full max-w-lg bg-gray-900 border border-gray-800 shadow-2xl rounded-2xl p-10 text-center">

          <h2 className="text-3xl font-bold text-green-400 mb-4 drop-shadow">
            Secure Session Setup 🔐
          </h2>

          {/* ⭐ MITM Protection Toggle Switch */}
          <div className="flex items-center justify-between mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700">
            <p className="text-gray-300 font-medium">MITM Protection</p>

            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={mitmProtection}
                onChange={() => setMitmProtection(!mitmProtection)}
              />
              <div className="w-12 h-6 bg-gray-600 peer-focus:ring-2 peer-focus:ring-green-400 rounded-full peer peer-checked:bg-green-500 transition relative">
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition" />
              </div>
            </label>
          </div>

          <p className="text-gray-300 mb-6 text-lg">{message}</p>

          <Spinner />

          {/* Progress List */}
          <div className="mt-8 text-left space-y-2 text-sm text-gray-400">
            <p className={step === "loading-identity" ? "text-green-400 font-bold" : ""}>
              ➤ Loading identity keys
            </p>
            <p className={step === "initiating" ? "text-green-400 font-bold" : ""}>
              ➤ Exchanging ephemeral keys ({mitmProtection ? "secure" : "vulnerable"})
            </p>
            <p className={step === "deriving" ? "text-green-400 font-bold" : ""}>
              ➤ Deriving shared ECDH secret
            </p>

            {mitmProtection && (
              <>
                <p className={step === "confirming" ? "text-green-400 font-bold" : ""}>
                  ➤ Confirming session handshake
                </p>
                <p className={step === "decrypting-group-key" ? "text-green-400 font-bold" : ""}>
                  ➤ Decrypting group session key
                </p>
              </>
            )}

            <p className={step === "done" ? "text-green-500 font-bold" : ""}>✔ Complete!</p>
          </div>

          <Button
            onClick={runHandshake}
            disabled={step !== "idle" && step !== "done"}
            className="mt-8 bg-gray-800 text-white hover:bg-gray-700 border border-gray-600"
            variant="secondary"
          >
            Retry
          </Button>

        </Card>
      </div>
    </AuthGuard>
  );
}
