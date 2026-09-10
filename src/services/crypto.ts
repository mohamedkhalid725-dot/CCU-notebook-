/**
 * CardioVault - Local-First Encryption Utility
 *
 * Uses:
 * - AES-GCM 256-bit encryption
 * - PBKDF2 with SHA-256
 * - 100,000 iterations
 *
 * Designed to be safe in browser and Capacitor/Android WebView
 * environments.
 */

function getCrypto(): Crypto {
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto;
  }

  throw new Error('Web Crypto API is not available on this device.');
}

// Buffer -> hex
function buf2hex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes =
    buffer instanceof Uint8Array
      ? buffer
      : new Uint8Array(buffer);

  return Array.from(bytes)
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}

// Hex -> Uint8Array
function hex2buf(hexString: string): Uint8Array {
  if (
    typeof hexString !== 'string' ||
    hexString.length === 0 ||
    hexString.length % 2 !== 0 ||
    !/^[0-9a-fA-F]+$/.test(hexString)
  ) {
    throw new Error('Invalid hexadecimal data.');
  }

  const bytes = new Uint8Array(hexString.length / 2);

  for (let i = 0; i < bytes.length; i++) {
    const value = parseInt(
      hexString.substring(i * 2, i * 2 + 2),
      16
    );

    if (!Number.isFinite(value)) {
      throw new Error('Invalid hexadecimal byte.');
    }

    bytes[i] = value;
  }

  return bytes;
}

// Generate random salt
export function generateSalt(length = 16): string {
  if (!Number.isInteger(length) || length < 8 || length > 1024) {
    throw new Error('Invalid salt length.');
  }

  const cryptoApi = getCrypto();
  const arr = new Uint8Array(length);

  cryptoApi.getRandomValues(arr);

  return buf2hex(arr);
}

// Derive AES-GCM key from PIN/password
async function deriveKey(
  pin: string,
  saltHex: string,
  usage: KeyUsage[]
): Promise<CryptoKey> {
  if (typeof pin !== 'string') {
    throw new Error('Invalid PIN.');
  }

  if (!Array.isArray(usage) || usage.length === 0) {
    throw new Error('Invalid cryptographic key usage.');
  }

  const cryptoApi = getCrypto();

  if (!cryptoApi.subtle) {
    throw new Error('Web Crypto Subtle API is not available.');
  }

  const enc = new TextEncoder();

  const keyMaterial = await cryptoApi.subtle.importKey(
    'raw',
    enc.encode(pin),
    {
      name: 'PBKDF2'
    },
    false,
    ['deriveKey']
  );

  const salt = hex2buf(saltHex);

  return await cryptoApi.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    usage
  );
}

// Hash PIN for local verification
export async function hashPin(
  pin: string,
  saltHex: string
): Promise<string> {
  try {
    if (typeof pin !== 'string') {
      throw new Error('Invalid PIN.');
    }

    const cryptoApi = getCrypto();

    if (!cryptoApi.subtle) {
      throw new Error('Web Crypto Subtle API is not available.');
    }

    // Validate the salt before hashing.
    hex2buf(saltHex);

    const enc = new TextEncoder();

    const data = enc.encode(
      pin + ':' + saltHex
    );

    const hashBuffer =
      await cryptoApi.subtle.digest(
        'SHA-256',
        data
      );

    return buf2hex(hashBuffer);
  } catch (err) {
    console.error('PIN hashing failed:', err);

    throw new Error(
      'PIN verification is unavailable on this device.'
    );
  }
}

// Encrypt plaintext -> ivHex:cipherHex
export async function encryptData(
  plainText: string,
  pin: string,
  saltHex: string
): Promise<string> {
  try {
    if (typeof plainText !== 'string') {
      throw new Error('Invalid plaintext.');
    }

    if (typeof pin !== 'string') {
      throw new Error('Invalid PIN.');
    }

    const cryptoApi = getCrypto();

    if (!cryptoApi.subtle) {
      throw new Error('Web Crypto Subtle API is not available.');
    }

    const key = await deriveKey(
      pin,
      saltHex,
      ['encrypt']
    );

    // AES-GCM recommends a unique 12-byte IV.
    const iv = cryptoApi.getRandomValues(
      new Uint8Array(12)
    );

    const enc = new TextEncoder();

    const encodedData = enc.encode(
      plainText
    );

    const cipherBuffer =
      await cryptoApi.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        encodedData
      );

    return `${buf2hex(iv)}:${buf2hex(cipherBuffer)}`;
  } catch (err) {
    console.error(
      'Encryption failed:',
      err
    );

    throw new Error(
      'Encryption failed. Please try again.'
    );
  }
}

// Decrypt ivHex:cipherHex -> plaintext
export async function decryptData(
  cipherPackage: string,
  pin: string,
  saltHex: string
): Promise<string> {
  try {
    if (
      typeof cipherPackage !== 'string' ||
      typeof pin !== 'string'
    ) {
      throw new Error(
        'Invalid encrypted data.'
      );
    }

    const parts =
      cipherPackage.split(':');

    if (parts.length !== 2) {
      throw new Error(
        'Invalid cipher payload format.'
      );
    }

    const iv = hex2buf(parts[0]);

    // AES-GCM standard IV used by this app is 12 bytes.
    if (iv.length !== 12) {
      throw new Error(
        'Invalid encryption IV.'
      );
    }

    const cipherBuffer =
      hex2buf(parts[1]);

    if (cipherBuffer.length === 0) {
      throw new Error(
        'Empty encrypted payload.'
      );
    }

    const cryptoApi = getCrypto();

    if (!cryptoApi.subtle) {
      throw new Error(
        'Web Crypto Subtle API is not available.'
      );
    }

    const key = await deriveKey(
      pin,
      saltHex,
      ['decrypt']
    );

    const decryptedBuffer =
      await cryptoApi.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        cipherBuffer
      );

    const dec = new TextDecoder();

    return dec.decode(
      decryptedBuffer
    );
  } catch (err) {
    console.error(
      'Decryption error:',
      err
    );

    throw new Error(
      'Incorrect PIN or corrupted database payload.'
    );
  }
}
