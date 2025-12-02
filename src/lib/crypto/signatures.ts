// src/lib/crypto/signatures.ts

/**
 * Sign raw data using the user's identity private key.
 * Supports RSA-PSS or ECDSA (P-256).
 *
 * @param data ArrayBuffer to sign
 * @param privateKey CryptoKey (RSA or EC)
 */
export async function signData(
  data: ArrayBuffer,
  privateKey: CryptoKey
): Promise<ArrayBuffer> {
  if (!window.crypto?.subtle) {
    throw new Error("WebCrypto SubtleCrypto not supported.");
  }

  const algo: AlgorithmIdentifier | RsaPssParams | EcdsaParams =
    privateKey.algorithm.name === "RSA-PSS"
      ? {
          name: "RSA-PSS",
          saltLength: 32,
        }
      : {
          name: "ECDSA",
          hash: { name: "SHA-256" },
        };

  return window.crypto.subtle.sign(algo, privateKey, data);
}

/**
 * Verify a signature using the peer's identity public key.
 * Supports RSA-PSS and ECDSA.
 *
 * @param publicKey CryptoKey (identity public key)
 * @param signature Signature ArrayBuffer
 * @param data Raw message data (ArrayBuffer)
 */
export async function verifySignature(
  publicKey: CryptoKey,
  signature: ArrayBuffer,
  data: ArrayBuffer
): Promise<boolean> {
  const algo: AlgorithmIdentifier | RsaPssParams | EcdsaParams =
    publicKey.algorithm.name === "RSA-PSS"
      ? {
          name: "RSA-PSS",
          saltLength: 32,
        }
      : {
          name: "ECDSA",
          hash: { name: "SHA-256" },
        };

  return window.crypto.subtle.verify(algo, publicKey, signature, data);
}
