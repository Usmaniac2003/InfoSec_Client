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

  async function runHandshake() {
    try {
      setStep("loading-identity");
      const identity = await ensureIdentityKeys();
      if (!identity) throw new Error("No identity keys");

      // 1. Initiate
      setStep("generating");
      const { eph, serverResp } = await initiate(identity);
      const handshakeId = serverResp.handshakeId;

      // 2. Derive session key
      setStep("deriving");
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

      // 3. Confirm
      setStep("confirming");
      const confirmRes = await confirm(sessionKey, handshakeId);

      // 🟩 Decrypt group key
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

      // 5. Redirect
      setStep("done");
      router.push("/chat");
    } catch (err) {
      console.error(err);
      setStep("idle");
      setMessage("Error establishing secure session.");
    }
  }

  function base64ToBuf(b64: string) {
    return Uint8Array.from(Buffer.from(b64, "base64")).buffer;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center p-4 bg-blue-50">
        <Card className="w-full max-w-lg text-center py-10">
          <h2 className="text-2xl font-semibold mb-2">Secure Session 🔐</h2>

          <p className="mb-8">{message}</p>
          <Spinner />

          <Button
            onClick={runHandshake}
            disabled={step !== "idle" && step !== "done"}
            className="mt-6"
            variant="secondary"
          >
            Retry
          </Button>
        </Card>
      </div>
    </AuthGuard>
  );
}
