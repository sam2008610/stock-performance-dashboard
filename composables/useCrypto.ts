/**
 * Secure localStorage encryption utility using Web Crypto API
 * Provides AES-GCM encryption for sensitive data storage
 */

export interface EncryptedData {
  data: string
  iv: string
  salt: string
  encrypted: true
}

export interface CryptoResult<T> {
  success: boolean
  data?: T
  error?: string
}

// Check if data is encrypted
export function isEncryptedData(data: any): data is EncryptedData {
  return data && typeof data === 'object' && data.encrypted === true && data.data && data.iv && data.salt
}

export const useCrypto = () => {
  // Generate a random salt for key derivation
  const generateSalt = (): Uint8Array => {
    return crypto.getRandomValues(new Uint8Array(16))
  }

  // Generate a random IV for encryption
  const generateIV = (): Uint8Array => {
    return crypto.getRandomValues(new Uint8Array(12))
  }

  // Derive encryption key from password and salt using PBKDF2
  const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    )

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )
  }

  // Get or generate the master password for encryption
  const getMasterPassword = (): string => {
    let masterPassword = localStorage.getItem('__crypto_master_key')
    
    if (!masterPassword) {
      // Generate a new master password
      const array = new Uint8Array(32)
      crypto.getRandomValues(array)
      masterPassword = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
      
      try {
        localStorage.setItem('__crypto_master_key', masterPassword)
      } catch (error) {
        console.error('Failed to store master key:', error)
        throw new Error('Failed to initialize encryption')
      }
    }
    
    return masterPassword
  }

  // Convert ArrayBuffer to base64 string
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  // Convert base64 string to ArrayBuffer
  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  // Encrypt data using AES-GCM
  const encrypt = async (data: string): Promise<CryptoResult<EncryptedData>> => {
    try {
      if (!data) {
        return { success: false, error: 'No data to encrypt' }
      }

      const masterPassword = getMasterPassword()
      const salt = generateSalt()
      const iv = generateIV()
      
      const key = await deriveKey(masterPassword, salt)
      const encoder = new TextEncoder()
      const encodedData = encoder.encode(data)
      
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        encodedData
      )

      const encryptedData: EncryptedData = {
        data: arrayBufferToBase64(encryptedBuffer),
        iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
        salt: arrayBufferToBase64(salt.buffer as ArrayBuffer),
        encrypted: true
      }

      return { success: true, data: encryptedData }
    } catch (error) {
      console.error('Encryption failed:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Encryption failed' }
    }
  }

  // Decrypt data using AES-GCM
  const decrypt = async (encryptedData: EncryptedData): Promise<CryptoResult<string>> => {
    try {
      if (!isEncryptedData(encryptedData)) {
        return { success: false, error: 'Invalid encrypted data format' }
      }

      const masterPassword = getMasterPassword()
      const salt = new Uint8Array(base64ToArrayBuffer(encryptedData.salt))
      const iv = new Uint8Array(base64ToArrayBuffer(encryptedData.iv))
      const data = base64ToArrayBuffer(encryptedData.data)
      
      const key = await deriveKey(masterPassword, salt)
      
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        data
      )

      const decoder = new TextDecoder()
      const decryptedData = decoder.decode(decryptedBuffer)

      return { success: true, data: decryptedData }
    } catch (error) {
      console.error('Decryption failed:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Decryption failed' }
    }
  }

  // Test encryption/decryption functionality
  const testCrypto = async (): Promise<boolean> => {
    try {
      const testData = 'test encryption data'
      const encryptResult = await encrypt(testData)
      
      if (!encryptResult.success || !encryptResult.data) {
        console.error('Encryption test failed')
        return false
      }

      const decryptResult = await decrypt(encryptResult.data)
      
      if (!decryptResult.success || decryptResult.data !== testData) {
        console.error('Decryption test failed')
        return false
      }

      return true
    } catch (error) {
      console.error('Crypto test failed:', error)
      return false
    }
  }

  // Reset encryption (generate new master key)
  const resetEncryption = (): void => {
    try {
      localStorage.removeItem('__crypto_master_key')
      console.log('Encryption reset completed')
    } catch (error) {
      console.error('Failed to reset encryption:', error)
    }
  }

  // Check if Web Crypto API is available
  const isCryptoSupported = (): boolean => {
    return typeof crypto !== 'undefined' && 
           typeof crypto.subtle !== 'undefined' && 
           typeof crypto.getRandomValues === 'function'
  }

  return {
    encrypt,
    decrypt,
    testCrypto,
    resetEncryption,
    isCryptoSupported,
    isEncryptedData
  }
}