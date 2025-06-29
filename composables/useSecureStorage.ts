/**
 * Secure localStorage wrapper with encryption support
 * Provides transparent encryption/decryption for sensitive data
 */

import { useCrypto, isEncryptedData, type EncryptedData } from './useCrypto'

export interface SecureStorageOptions {
  encrypt?: boolean
  fallbackToPlainText?: boolean
}

export const useSecureStorage = () => {
  const { encrypt, decrypt, isCryptoSupported } = useCrypto()

  // Set item in localStorage with optional encryption
  const setItem = async (
    key: string, 
    value: any, 
    options: SecureStorageOptions = { encrypt: true, fallbackToPlainText: true }
  ): Promise<boolean> => {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
      
      if (options.encrypt && isCryptoSupported()) {
        const encryptResult = await encrypt(stringValue)
        
        if (encryptResult.success && encryptResult.data) {
          localStorage.setItem(key, JSON.stringify(encryptResult.data))
          return true
        } else {
          console.warn(`Encryption failed for key ${key}:`, encryptResult.error)
          
          if (options.fallbackToPlainText) {
            console.log(`Falling back to plain text storage for key ${key}`)
            localStorage.setItem(key, stringValue)
            return true
          } else {
            return false
          }
        }
      } else {
        // Store as plain text if encryption is disabled or not supported
        localStorage.setItem(key, stringValue)
        return true
      }
    } catch (error) {
      console.error(`Failed to set item ${key}:`, error)
      return false
    }
  }

  // Get item from localStorage with automatic decryption
  const getItem = async <T = any>(
    key: string, 
    defaultValue: T | null = null
  ): Promise<T | null> => {
    try {
      const storedValue = localStorage.getItem(key)
      
      if (!storedValue) {
        return defaultValue
      }

      // Try to parse as JSON first (could be encrypted data or plain JSON)
      let parsedValue: any
      try {
        parsedValue = JSON.parse(storedValue)
      } catch {
        // If parsing fails, treat as plain text
        return storedValue as T
      }

      // Check if the parsed value is encrypted data
      if (isEncryptedData(parsedValue)) {
        const decryptResult = await decrypt(parsedValue)
        
        if (decryptResult.success && decryptResult.data) {
          // Try to parse the decrypted data as JSON
          try {
            return JSON.parse(decryptResult.data) as T
          } catch {
            // If parsing fails, return as string
            return decryptResult.data as T
          }
        } else {
          console.error(`Failed to decrypt data for key ${key}:`, decryptResult.error)
          return defaultValue
        }
      } else {
        // Data is not encrypted, return as-is
        return parsedValue as T
      }
    } catch (error) {
      console.error(`Failed to get item ${key}:`, error)
      return defaultValue
    }
  }

  // Remove item from localStorage
  const removeItem = (key: string): boolean => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Failed to remove item ${key}:`, error)
      return false
    }
  }

  // Check if a key exists in localStorage
  const hasItem = (key: string): boolean => {
    try {
      return localStorage.getItem(key) !== null
    } catch (error) {
      console.error(`Failed to check item ${key}:`, error)
      return false
    }
  }

  // Migrate plain text data to encrypted storage
  const migrateToEncrypted = async (key: string): Promise<boolean> => {
    try {
      const existingValue = localStorage.getItem(key)
      
      if (!existingValue) {
        return true // Nothing to migrate
      }

      // Check if already encrypted
      try {
        const parsed = JSON.parse(existingValue)
        if (isEncryptedData(parsed)) {
          return true // Already encrypted
        }
      } catch {
        // Not JSON, treat as plain text
      }

      // Migrate to encrypted storage
      const success = await setItem(key, existingValue, { encrypt: true, fallbackToPlainText: false })
      
      if (success) {
        console.log(`Successfully migrated ${key} to encrypted storage`)
        return true
      } else {
        console.error(`Failed to migrate ${key} to encrypted storage`)
        return false
      }
    } catch (error) {
      console.error(`Migration failed for key ${key}:`, error)
      return false
    }
  }

  // Get all keys that contain encrypted data
  const getEncryptedKeys = (): string[] => {
    const encryptedKeys: string[] = []
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key)
          if (value) {
            try {
              const parsed = JSON.parse(value)
              if (isEncryptedData(parsed)) {
                encryptedKeys.push(key)
              }
            } catch {
              // Not JSON, skip
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to get encrypted keys:', error)
    }
    
    return encryptedKeys
  }

  // Backup data (returns unencrypted data for backup purposes)
  const backup = async (): Promise<Record<string, any>> => {
    const backup: Record<string, any> = {}
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && !key.startsWith('__crypto_')) {
          const value = await getItem(key)
          backup[key] = value
        }
      }
    } catch (error) {
      console.error('Backup failed:', error)
    }
    
    return backup
  }

  // Restore data from backup
  const restore = async (
    backupData: Record<string, any>, 
    options: SecureStorageOptions = { encrypt: true, fallbackToPlainText: true }
  ): Promise<boolean> => {
    try {
      for (const [key, value] of Object.entries(backupData)) {
        const success = await setItem(key, value, options)
        if (!success) {
          console.error(`Failed to restore key: ${key}`)
          return false
        }
      }
      return true
    } catch (error) {
      console.error('Restore failed:', error)
      return false
    }
  }

  // Clear all encrypted data (keeps plain text data)
  const clearEncryptedData = (): void => {
    try {
      const encryptedKeys = getEncryptedKeys()
      encryptedKeys.forEach(key => {
        localStorage.removeItem(key)
      })
      console.log(`Cleared ${encryptedKeys.length} encrypted items`)
    } catch (error) {
      console.error('Failed to clear encrypted data:', error)
    }
  }

  return {
    setItem,
    getItem,
    removeItem,
    hasItem,
    migrateToEncrypted,
    getEncryptedKeys,
    backup,
    restore,
    clearEncryptedData
  }
}