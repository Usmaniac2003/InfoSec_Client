// src/lib/crypto/rsa.ts

/**
 * This file should handle:
 * - Generating RSA/ECC key pairs
 * - Exporting public key (e.g., JWK or SPKI)
 * - Importing public keys from server
 *
 * Use Web Crypto API:
 * - subtle.generateKey
 * - subtle.exportKey
 * - subtle.importKey
 */

export async function generateRsaKeyPair() {
  // TODO: subtle.generateKey for "RSA-PSS" or "RSASSA-PKCS1-v1_5"
  // with modulusLength >= 2048
  throw new Error("Not implemented");
}

export async function exportPublicKeyToJwk(publicKey: CryptoKey): Promise<JsonWebKey> {
  // TODO: subtle.exportKey("jwk", publicKey)
  throw new Error("Not implemented");
}

export async function importPublicKeyFromJwk(jwk: JsonWebKey): Promise<CryptoKey> {
  // TODO: subtle.importKey("jwk", jwk, alg, true, ["verify"])
  throw new Error("Not implemented");
}
