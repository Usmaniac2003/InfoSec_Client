// src/lib/crypto/signatures.ts

/**
 * This file should:
 * - Sign arbitrary data (e.g., your ECDH public key + metadata)
 * - Verify signatures (e.g., server's signed response)
 *
 * Steps:
 * 1. Encode data to ArrayBuffer (e.g., TextEncoder).
 * 2. Use subtle.sign / subtle.verify.
 */

export async function signData(params: {
  privateKey: CryptoKey;
  data: Uint8Array;
}): Promise<Uint8Array> {
  // TODO: subtle.sign with appropriate algorithm for your RSA/ECC choice
  throw new Error("Not implemented");
}

export async function verifySignature(params: {
  publicKey: CryptoKey;
  data: Uint8Array;
  signature: Uint8Array;
}): Promise<boolean> {
  // TODO: subtle.verify
  throw new Error("Not implemented");
}
