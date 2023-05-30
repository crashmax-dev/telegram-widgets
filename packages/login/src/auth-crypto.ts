export class AuthCrypto {
  #crypto: Crypto
  #encoder: TextEncoder
  #decoder: TextDecoder
  #cryptoKey: CryptoKey

  constructor(crypto: Crypto, password: string) {
    this.#crypto = crypto
    this.#encoder = new TextEncoder()
    this.#decoder = new TextDecoder()

    this.#crypto.subtle
      .importKey('raw', this.#encoder.encode(password), 'PBKDF2', false, [
        'deriveKey'
      ])
      .then((cryptoKey) => (this.#cryptoKey = cryptoKey))
  }

  // for large strings, use this from https://stackoverflow.com/a/49124600
  #bufferToBase64(buffer: Uint8Array): string {
    return btoa(
      new Uint8Array(buffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    )
  }

  #base64ToBuffer(base64: string): Uint8Array {
    return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
  }

  async #deriveKey(
    salt: BufferSource,
    keyUsage: ReadonlyArray<KeyUsage>
  ): Promise<CryptoKey> {
    return await this.#crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 250000,
        hash: 'SHA-256'
      },
      this.#cryptoKey,
      { name: 'AES-GCM', length: 256 },
      false,
      keyUsage
    )
  }

  async encryptData(secretData: string): Promise<string | null> {
    try {
      const salt = this.#crypto.getRandomValues(new Uint8Array(16))
      const iv = this.#crypto.getRandomValues(new Uint8Array(12))
      const aesKey = await this.#deriveKey(salt, ['encrypt'])
      const encryptedContent = await this.#crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        aesKey,
        this.#encoder.encode(secretData)
      )

      const encryptedContentArr = new Uint8Array(encryptedContent)
      const buffer = new Uint8Array(
        salt.byteLength + iv.byteLength + encryptedContentArr.byteLength
      )
      buffer.set(salt, 0)
      buffer.set(iv, salt.byteLength)
      buffer.set(encryptedContentArr, salt.byteLength + iv.byteLength)

      return this.#bufferToBase64(buffer)
    } catch {
      return null
    }
  }

  async decryptData(encryptedData: string): Promise<string | null> {
    try {
      const encryptedDataBuffer = this.#base64ToBuffer(encryptedData)
      const salt = encryptedDataBuffer.slice(0, 16)
      const iv = encryptedDataBuffer.slice(16, 16 + 12)
      const data = encryptedDataBuffer.slice(16 + 12)
      const aesKey = await this.#deriveKey(salt, ['decrypt'])
      const decryptedData = await this.#crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        aesKey,
        data
      )

      return this.#decoder.decode(decryptedData)
    } catch {
      return null
    }
  }
}
