// src/lib/crypto/dh.ts

/**
 * Generate an ephemeral ECDH keypair.
 * Curve: P-256 (required by project, allowed by WebCrypto)
 */
export async function generateEphemeralECDH(): Promise<CryptoKeyPair> {
  if (!window.crypto?.subtle) {
    throw new Error("WebCrypto SubtleCrypto not supported in this environment.");
  }

  return window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true, // extractable (necessary to export raw public key)
    ["deriveKey", "deriveBits"]
  );
}

/**
 * Derive the raw shared secret from ECDH.
 * @param privateKey - Your ephemeral ECDH private key
 * @param peerPublicKey - The peer's ECDH public key
 */
export async function deriveSharedSecret(
  privateKey: CryptoKey,
  peerPublicKey: CryptoKey
): Promise<ArrayBuffer> {
  if (!window.crypto?.subtle) {
    throw new Error("WebCrypto SubtleCrypto not supported.");
  }

  // Raw shared secret bits
  return window.crypto.subtle.deriveBits(
    {
      name: "ECDH",
      public: peerPublicKey,
    },
    privateKey,
    256 // 256 bits = 32 bytes (perfect for HKDF → AES-256)
  );
}

/**
 * Import a raw ECDH public key from ArrayBuffer.
 * Useful when receiving Base64 keys from backend.
 */
export async function importEcdhPublicKey(rawKey: ArrayBuffer): Promise<CryptoKey> {
  return window.crypto.subtle.importKey(
    "raw",
    rawKey,
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    []
  );
}

/**
 * Export ECDH public key to raw ArrayBuffer.
 * Used when sending key to backend.
 */
export async function exportEcdhPublicKey(publicKey: CryptoKey): Promise<ArrayBuffer> {
  return window.crypto.subtle.exportKey("raw", publicKey);
}
