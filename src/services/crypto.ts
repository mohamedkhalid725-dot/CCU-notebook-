/**
 * Web Crypto API client-side encryption utility for Local-First Privacy.
 * All patient information is encrypted with AES-GCM 256-bit key derived
 * from user's PIN using PBKDF2 with 100,000 iterations.
 */

// Buffer to hex helper
function buf2hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
}

// Hex to buffer helper
function hex2buf(hexString: string): Uint8Array {
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
  }
  return bytes;
}

// Generate random salt
export function generateSalt(length = 16): string {
  const arr = new Uint8Array(length);
  window.crypto.getRandomValues(arr);
  return buf2hex(arr.buffer);
}

// Derive PBKDF2 key from PIN/password
async function deriveKey(pin: string, saltHex: string, usage: KeyUsage[]): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveKey', 'deriveBits']
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: hex2buf(saltHex),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    usage
  );
}

// Hash PIN for verification
export async function hashPin(pin: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(pin + ':' + saltHex);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return buf2hex(hashBuffer);
}

// Encrypt plaintext string to AES-GCM hex string
export async function encryptData(plainText: string, pin: string, saltHex: string): Promise<string> {
  try {
    const key = await deriveKey(pin, saltHex, ['encrypt']);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const encodedData = enc.encode(plainText);

    const cipherBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encodedData
    );

    // Format: ivHex:cipherHex
    return `${buf2hex(iv.buffer)}:${buf2hex(cipherBuffer)}`;
  } catch (err) {
    console.error('Encryption failed:', err);
    throw new Error('Encryption failed');
  }
}

// Decrypt AES-GCM hex string back to plaintext
export async function decryptData(cipherPackage: string, pin: string, saltHex: string): Promise<string> {
  try {
    const parts = cipherPackage.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid cipher payload format');
    }
    const iv = hex2buf(parts[0]);
    const cipherBuffer = hex2buf(parts[1]);

    const key = await deriveKey(pin, saltHex, ['decrypt']);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      cipherBuffer
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (err) {
    console.error('Decryption error:', err);
    throw new Error('Incorrect PIN or corrupted database payload');
  }
}
