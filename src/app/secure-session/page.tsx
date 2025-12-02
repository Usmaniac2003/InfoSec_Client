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

  const [step, setStep] = useState<
    | "idle"
    | "loading-identity"
    | "generating"
    | "deriving"
    | "confirming"
    | "done"
  >("idle");

  const [message, setMessage] = useState("Preparing secure session...");

  useEffect(() => {
    runHandshake();
  }, []);

  async function runHandshake() {
    try {
      // STEP 0 — Ensure identity keys exist
      setStep("loading-identity");
      setMessage("Loading identity keys...");
      const identity = await ensureIdentityKeys();
      if (!identity) throw new Error("No identity keys"); // FIXED
      await wait(300);

      // STEP 1 — Initiate handshake
      setStep("generating");
      setMessage("Initiating handshake...");
      const { eph, ephRaw, serverResp } = await initiate(identity);
      const handshakeId = serverResp.handshakeId;
      await wait(300);

      // STEP 2 — Derive session key
      setStep("deriving");
      setMessage("Deriving shared session key...");
      const serverRaw = base64ToBuf(serverResp.serverEphemeralKey);

      const serverPubKey = await crypto.subtle.importKey(
        "raw",
        serverRaw,
        { name: "ECDH", namedCurve: "P-256" },
        true,
        []
      );

      const sharedSecret = await deriveSharedSecret(eph.privateKey, serverPubKey);
      const sessionKey = await hkdfDeriveAES256Key(sharedSecret);
      cryptoContext.setSessionKey(sessionKey);
      await wait(300);

      // STEP 3 — Confirm handshake
      setStep("confirming");
      setMessage("Confirming secure session...");
      await confirm(sessionKey, handshakeId);
      await wait(300);

      // STEP 4 — Done
      setStep("done");
      setMessage("Secure session established! Redirecting...");
      await wait(700);

      router.push("/chat");
    } catch (err) {
      console.error(err);
      setMessage("Error establishing secure session. Please retry.");
      setStep("idle");
    }
  }

  function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
        <Card className="w-full max-w-lg text-center py-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Establishing Secure Session 🔐
          </h2>

          <p className="text-gray-600 mb-8">{message}</p>

          <div className="flex justify-center mb-6">
            <Spinner />
          </div>

          <Button
            className="mt-8"
            variant="secondary"
            onClick={runHandshake}
            disabled={step !== "idle" && step !== "done"}
          >
            Retry
          </Button>
        </Card>
      </div>
    </AuthGuard>
  );
}

function base64ToBuf(b64: string): ArrayBuffer {
  return Uint8Array.from(Buffer.from(b64, "base64")).buffer;
}
