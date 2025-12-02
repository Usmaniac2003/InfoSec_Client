// AES-256-GCM encryption & decryption helpers

export async function encryptText(sessionKey: CryptoKey, text: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    sessionKey,
    encoded
  );

  return {
    iv: bufferToB64(iv),
    ciphertext: bufferToB64(ciphertext),
  };
}

export async function decryptText(sessionKey: CryptoKey, ciphertext: string, iv: string) {
  try {
    const ct = b64ToU8(ciphertext);
    const ivBuf = b64ToU8(iv);

    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBuf },
      sessionKey,
      ct
    );

    return new TextDecoder().decode(plaintext);
  } catch {
    return "**Decryption Failed**";
  }
}

export async function encryptFile(sessionKey: CryptoKey, file: File) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await file.arrayBuffer();

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    sessionKey,
    data
  );

  return {
    iv: bufferToB64(iv),
    ciphertext: bufferToB64(ciphertext),
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
  };
}

export async function decryptFile(sessionKey: CryptoKey, ciphertext: string, iv: string) {
  const ct = b64ToU8(ciphertext);
  const ivBuf = b64ToU8(iv);

  return crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBuf }, sessionKey, ct);
}

function bufferToB64(buf: ArrayBuffer | Uint8Array) {
  return Buffer.from(buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf).toString("base64");
}
function b64ToU8(b64: string) {
  return Uint8Array.from(Buffer.from(b64, "base64"));
}
