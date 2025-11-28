// src/lib/crypto/hashing.ts

/**
 * This file should provide:
 * - SHA-256 hashing
 * - HKDF-like key derivation (or similar)
 *
 * For SHA-256:
 * - subtle.digest("SHA-256", data)
 *
 * For HKDF-like derivation:
 * - Use HMAC or a standard HKDF construction manually.
 * - Or use subtle.deriveKey with ECDH directly into AES-GCM key (valid approach).
 */

export async function sha256(data: Uint8Array): Promise<Uint8Array> {
  // TODO: subtle.digest("SHA-256", data)
  throw new Error("Not implemented");
}

export async function deriveSessionKeyFromSecret(params: {
  secret: ArrayBuffer;        // from ECDH
  info?: Uint8Array;          // context/info string
  lengthBits?: number;        // e.g., 256 for AES-256
}): Promise<Uint8Array> {
  // TODO:
  // - Implement HKDF-like function (extract + expand)
  // - Or document your own derivation (must be sound!)
  throw new Error("Not implemented");
}
