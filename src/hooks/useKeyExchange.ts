"use client";

import api from "@/lib/api/api";
import { signData } from "@/lib/crypto/signatures";
import { generateEphemeralECDH } from "@/lib/crypto/dh";
import { exportPublicKeyToJwk } from "@/lib/crypto/keys";
import { API_ROUTES } from "@/lib/api/routes";

export function useKeyExchange() {
  async function initiate(identityKeys: any) {
    const eph = await generateEphemeralECDH();
    const ephRaw = await crypto.subtle.exportKey("raw", eph.publicKey);

    const signature = await signData(ephRaw, identityKeys.privateKey);

    const payload = {
      clientEphemeralKey: bufferToB64(ephRaw),
      clientIdentityKey: await exportPublicKeyToJwk(identityKeys.publicKey),
      signature: bufferToB64(signature),
      nonce: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    const res = await api.post(API_ROUTES.keyExchange.initiate, payload);

    return { eph, serverResp: res.data };
  }

  async function confirm(sessionKey: CryptoKey, handshakeId: string) {
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      sessionKey,
      new TextEncoder().encode("KEY_CONFIRM")
    );

    const payload = {
      handshakeId,
      iv: bufferToB64(iv),
      confirmationTag: bufferToB64(ciphertext),
      nonce: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    const res = await api.post(API_ROUTES.keyExchange.confirm, payload);
    return res.data;
  }

  return { initiate, confirm };
}

function bufferToB64(buf: ArrayBuffer | Uint8Array) {
  return Buffer.from(
    buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf
  ).toString("base64");
}
