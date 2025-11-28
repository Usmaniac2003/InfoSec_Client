// src/lib/crypto/dh.ts

/**
 * This file handles ECDH (Elliptic Curve Diffie-Hellman) using NIST curves:
 * - P-256 or P-384 (required by your project)
 *
 * Use Web Crypto:
 * - subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, ...)
 * - subtle.deriveBits / deriveKey
 */

export async function generateEcdhKeyPair() {
  // TODO: subtle.generateKey with { name: "ECDH", namedCurve: "P-256" }
  throw new Error("Not implemented");
}

export async function deriveSharedSecret(params: {
  privateKey: CryptoKey;
  publicKey: CryptoKey;
}): Promise<ArrayBuffer> {
  // TODO: subtle.deriveBits or subtle.deriveKey
  throw new Error("Not implemented");
}
