// src/lib/crypto/aes.ts

/**
 * This file should implement AES-256-GCM using Web Crypto.
 * High-level steps (you implement details):
 * 1. Generate/import a CryptoKey for AES-GCM (256-bit).
 * 2. Encrypt: use window.crypto.subtle.encrypt with:
 *    - algorithm: { name: "AES-GCM", iv, additionalData? }
 * 3. Decrypt similarly with subtle.decrypt.
 * 4. Return Base64/Uint8Array as needed.
 */

export async function generateAesKey(): Promise<CryptoKey> {
  // TODO: use window.crypto.subtle.generateKey with AES-GCM 256-bit
  throw new Error("Not implemented");
}

export async function encryptAesGcm(params: {
  key: CryptoKey;
  plaintext: Uint8Array;
  iv: Uint8Array;
  additionalData?: Uint8Array;
}): Promise<Uint8Array> {
  // TODO:
  // - call subtle.encrypt
  // - return ciphertext (including auth tag if you choose that layout)
  throw new Error("Not implemented");
}

export async function decryptAesGcm(params: {
  key: CryptoKey;
  ciphertext: Uint8Array;
  iv: Uint8Array;
  additionalData?: Uint8Array;
}): Promise<Uint8Array> {
  // TODO:
  // - call subtle.decrypt
  // - return plaintext
  throw new Error("Not implemented");
}
