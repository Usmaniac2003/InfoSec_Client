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

export default function SecureSessionPage() {
  const router = useRouter();
  const cryptoContext = useCryptoContext();
  const { initiate, confirm } = useKeyExchange();
  const { ensureKeys: ensureIdentityKeys } = useIdentityKeys("EC");

  const [step, setStep] = useState("idle");
  const [message, setMessage] = useState("Preparing secure session...");

  useEffect(() => {
    runHandshake();
  }, []);

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
      setMessage("📡 Establishing handshake with the server...");
      await wait(800);

      const { eph, serverResp } = await initiate(identity);
      const handshakeId = serverResp.handshakeId;

      //
      // STEP 2 — Derive ECDH Shared Secret
      //
      setStep("deriving");
      setMessage("🧮 Deriving shared ECDH secret...");
      await wait(600);

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
      // STEP 3 — Confirm handshake
      //
      setStep("confirming");
      setMessage("🔐 Confirming secure session...");
      await wait(700);

      const confirmRes = await confirm(sessionKey, handshakeId);

      //
      // STEP 4 — Decrypt group key
      //
      setStep("decrypting-group-key");
      setMessage("🗝️ Decrypting shared group key...");
      await wait(600);

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

      // STEP 5 — Done
      setStep("done");
      setMessage("✅ Secure session established! Redirecting...");
      await wait(900);

      router.push("/chat");

    } catch (err) {
      console.error(err);
      setStep("idle");
      setMessage("❌ Error establishing secure session. Please retry.");
    }
  }

  function base64ToBuf(b64: string): ArrayBuffer {
    return Uint8Array.from(Buffer.from(b64, "base64")).buffer;
  }

  return (
    <AuthGuard>
      {/* MATCH DARK THEME BACKGROUND */}
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black px-4">

        {/* Main card */}
        <Card className="w-full max-w-lg bg-gray-900 border border-gray-800 shadow-2xl rounded-2xl p-10 text-center">

          {/* Title */}
          <h2 className="text-3xl font-bold text-green-400 drop-shadow mb-3">
            Establishing Secure Session 🔐
          </h2>

          {/* Subtitle */}
          <p className="text-gray-300 mb-8 text-lg">{message}</p>

          {/* Spinner */}
          <div className="flex justify-center mb-6">
            <Spinner />
          </div>

          {/* Progress List */}
          <div className="mt-8 text-left space-y-2 text-sm">

            <p className={
              step === "loading-identity"
                ? "font-bold text-green-400"
                : "text-gray-400"
            }>
              ➤ Loading identity keys
            </p>

            <p className={
              step === "initiating"
                ? "font-bold text-green-400"
                : "text-gray-400"
            }>
              ➤ Exchanging ephemeral keys
            </p>

            <p className={
              step === "deriving"
                ? "font-bold text-green-400"
                : "text-gray-400"
            }>
              ➤ Deriving shared ECDH secret
            </p>

            <p className={
              step === "confirming"
                ? "font-bold text-green-400"
                : "text-gray-400"
            }>
              ➤ Confirming session handshake
            </p>

            <p className={
              step === "decrypting-group-key"
                ? "font-bold text-green-400"
                : "text-gray-400"
            }>
              ➤ Decrypting group session key
            </p>

            <p className={
              step === "done"
                ? "font-bold text-green-500"
                : "text-gray-600"
            }>
              ✔ Complete!
            </p>
          </div>

          {/* Retry */}
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
