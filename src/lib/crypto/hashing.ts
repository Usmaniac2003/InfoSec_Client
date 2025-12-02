export async function hkdfDeriveAES256Key(sharedSecret: ArrayBuffer): Promise<CryptoKey> {
  const secretKey = await crypto.subtle.importKey(
    "raw",
    sharedSecret,
    "HKDF",
    false,
    ["deriveKey"]
  );

  const encoder = new TextEncoder();
  const info = encoder.encode("E2EE-Session-Key-Derivation");
  const salt = new Uint8Array(16); // must match backend static salt

  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt,
      info,
    },
    secretKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );
}
