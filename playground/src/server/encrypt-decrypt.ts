import { webcrypto } from 'node:crypto'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

// for large strings, use this from https://stackoverflow.com/a/49124600
function bufferToBase64(buffer: Uint8Array): string {
  return btoa(
    new Uint8Array(buffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ''
    )
  )
}

function base64ToBuffer(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
}

async function getPasswordKey(password: string): Promise<webcrypto.CryptoKey> {
  return await webcrypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )
}

async function deriveKey(
  passwordKey: CryptoKey,
  salt: BufferSource,
  keyUsage: ReadonlyArray<KeyUsage>
): Promise<webcrypto.CryptoKey> {
  return await webcrypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 250000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    keyUsage
  )
}

async function encryptData(
  secretData: string,
  password: CryptoKey
): Promise<string | null> {
  try {
    const salt = webcrypto.getRandomValues(new Uint8Array(16))
    const iv = webcrypto.getRandomValues(new Uint8Array(12))
    const aesKey = await deriveKey(password, salt, ['encrypt'])
    const encryptedContent = await webcrypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      aesKey,
      encoder.encode(secretData)
    )

    const encryptedContentArr = new Uint8Array(encryptedContent)
    const buffer = new Uint8Array(
      salt.byteLength + iv.byteLength + encryptedContentArr.byteLength
    )
    buffer.set(salt, 0)
    buffer.set(iv, salt.byteLength)
    buffer.set(encryptedContentArr, salt.byteLength + iv.byteLength)

    return bufferToBase64(buffer)
  } catch (err) {
    return null
  }
}

async function decryptData(
  encryptedData: string,
  password: CryptoKey
): Promise<string | null> {
  try {
    const encryptedDataBuffer = base64ToBuffer(encryptedData)
    const salt = encryptedDataBuffer.slice(0, 16)
    const iv = encryptedDataBuffer.slice(16, 16 + 12)
    const data = encryptedDataBuffer.slice(16 + 12)
    const aesKey = await deriveKey(password, salt, ['decrypt'])
    const decryptedData = await webcrypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      aesKey,
      data
    )

    return decoder.decode(decryptedData)
  } catch {
    return null
  }
}

async function app() {
  const data = JSON.stringify({ id: 1, name: 'John' })
  const password = await getPasswordKey('12345')

  const encryptedData = await encryptData(data, password)
  console.log('encryptedData', encryptedData)

  if (encryptedData) {
    const decryptedData = await decryptData(encryptedData, password)
    console.log('decryptedData', decryptedData)
  }
}

app()
