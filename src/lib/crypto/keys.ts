// src/lib/crypto/keys.ts

export type IdentityKeyAlgorithm = 'RSA' | 'EC';

export type IdentityKeyMetadata = {
  id: string; // e.g. `user:<userId>:identity`
  algorithm: IdentityKeyAlgorithm;
  createdAt: number;
};

export type IdentityKeyPair = {
  meta: IdentityKeyMetadata;
  publicKey: CryptoKey;
  privateKey: CryptoKey;
};

/**
 * Generate a long-term identity keypair.
 * - RSA: RSA-PSS 2048 / SHA-256 (for signatures)
 * - EC:  ECDSA P-256 / SHA-256
 */
export async function generateIdentityKeyPair(
  id: string,
  algorithm: IdentityKeyAlgorithm = 'EC'
): Promise<IdentityKeyPair> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    throw new Error('Web Crypto is not available (server-side or unsupported browser).');
  }

  let keyPair: CryptoKeyPair;

  if (algorithm === 'RSA') {
    keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-PSS',
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
        hash: 'SHA-256',
      },
      true, // extractable (we may want to export to JWK later)
      ['sign', 'verify']
    );
  } else {
    // EC (recommended): smaller keys, faster, matches project requirements (P-256)
    keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      true,
      ['sign', 'verify']
    );
  }

  const meta: IdentityKeyMetadata = {
    id,
    algorithm,
    createdAt: Date.now(),
  };

  return {
    meta,
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

/**
 * Export a public key to JWK for sending to the backend / other clients.
 */
export async function exportPublicKeyToJwk(publicKey: CryptoKey): Promise<JsonWebKey> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    throw new Error('Web Crypto is not available.');
  }

  return window.crypto.subtle.exportKey('jwk', publicKey);
}

/**
 * Import a public key from JWK (identity key, used for signature verification).
 */
export async function importPublicKeyFromJwk(
  jwk: JsonWebKey
): Promise<CryptoKey> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    throw new Error('Web Crypto is not available.');
  }

  if (!jwk.kty) {
    throw new Error('Invalid JWK: missing kty');
  }

  if (jwk.kty === 'RSA') {
    return window.crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'RSA-PSS',
        hash: 'SHA-256',
      },
      true,
      ['verify']
    );
  }

  if (jwk.kty === 'EC') {
    return window.crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      true,
      ['verify']
    );
  }

  throw new Error(`Unsupported JWK key type: ${jwk.kty}`);
}
