/**
 * Interface for AsyncStorage-like implementation
 */
interface AsyncStorageInterface {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  multiGet?(keys: string[]): Promise<readonly [string, string | null][]>;
  multiSet?(keyValuePairs: Array<[string, string]>): Promise<void>;
}

// Global AsyncStorage instance - can be injected by developer
let injectedAsyncStorage: AsyncStorageInterface | null = null;

/**
 * Initialize StorageHandler with AsyncStorage instance
 * @param asyncStorage - AsyncStorage instance to use for persistence
 */
export function initializeStorage(asyncStorage: AsyncStorageInterface): void {
  injectedAsyncStorage = asyncStorage;
}

/**
 * Interface for storage messages
 */
interface StorageMessage {
  type: string;
  callbackId?: string;
  data: {
    key: string;
    value?: any;
  };
}

interface CacheItem {
  value: string;
  timestamp: number;
  dirty?: boolean;
}

// In-memory cache with expiration support
const memoryCache: Record<string, CacheItem> = {};

// Default cache expiration time (5 minutes)
const DEFAULT_CACHE_EXPIRATION = 5 * 60 * 1000;

// Batch processing delay
const BATCH_DELAY = 200;

// Queue for write operations
const writeQueue: Array<{ key: string, value: string }> = [];
let batchWriteTimeout: NodeJS.Timeout | null = null;

// List of frequently accessed keys to preload
const frequentlyAccessedKeys: Set<string> = new Set();
const ACCESS_FREQUENCY_THRESHOLD = 3;
const keyAccessCount: Record<string, number> = {};

// In-memory fallback storage when AsyncStorage is not available
const memoryStorage: Record<string, string> = {};

// Safe AsyncStorage wrapper
const SafeStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      // Check if we have a valid cached item
      const cachedItem = memoryCache[key];
      if (cachedItem && Date.now() - cachedItem.timestamp < DEFAULT_CACHE_EXPIRATION) {
        // Update access count for this key
        keyAccessCount[key] = (keyAccessCount[key] || 0) + 1;

        // Add to frequently accessed keys if threshold reached
        if (keyAccessCount[key] >= ACCESS_FREQUENCY_THRESHOLD && !frequentlyAccessedKeys.has(key)) {
          frequentlyAccessedKeys.add(key);
        }

        return cachedItem.value;
      }

      if (!injectedAsyncStorage) {
        return memoryStorage[key] || null;
      }

      if (typeof injectedAsyncStorage.getItem !== 'function') {
        return memoryStorage[key] || null;
      }

      const value = await injectedAsyncStorage.getItem(key);

      // Update cache with fresh data
      if (value !== null) {
        memoryCache[key] = {
          value,
          timestamp: Date.now()
        };
      }

      return value;
    } catch (error) {
      return (memoryCache[key]?.value) || null;
    }
  },

  async setItem(key: string, value: string): Promise<boolean> {
    try {
      // Always update memory cache first
      memoryCache[key] = {
        value,
        timestamp: Date.now(),
        dirty: true
      };

      // Add to write queue for batch processing
      writeQueue.push({ key, value });

      // Schedule batch write if not already scheduled
      if (!batchWriteTimeout) {
        batchWriteTimeout = setTimeout(() => {
          processBatchWrites();
        }, BATCH_DELAY);
      }

      return true;
    } catch (error) {
      try {
        memoryStorage[key] = value;
        return true;
      } catch (memoryError) {
        return false;
      }
    }
  },

  // Method to preload frequently accessed keys into memory
  async preloadFrequentItems(): Promise<void> {
    if (!injectedAsyncStorage || frequentlyAccessedKeys.size === 0) {
      return;
    }

    const keysToLoad = Array.from(frequentlyAccessedKeys);
    try {
      if (injectedAsyncStorage.multiGet) {
        const multiResult = await injectedAsyncStorage.multiGet(keysToLoad);

        if (multiResult) {
          const now = Date.now();
          multiResult.forEach(([key, value]) => {
            if (value !== null) {
              memoryCache[key] = {
                value,
                timestamp: now
              };
            }
          });
        }
      }
    } catch (error) {
      // Silently fail preloading - it's just an optimization
    }
  },

  // Force-persist all queued writes immediately
  async flushWrites(): Promise<void> {
    if (batchWriteTimeout) {
      clearTimeout(batchWriteTimeout);
      batchWriteTimeout = null;
    }

    await processBatchWrites();
  }
};

// Process all queued write operations in a batch
async function processBatchWrites(): Promise<void> {
  if (!injectedAsyncStorage || writeQueue.length === 0) {
    batchWriteTimeout = null;
    return;
  }

  // Create a local copy of the queue
  const currentBatch = [...writeQueue];

  // Clear the queue and timeout reference
  writeQueue.length = 0;
  batchWriteTimeout = null;

  try {
    if (typeof injectedAsyncStorage.multiSet === 'function') {
      // Use efficient multiSet API if available
      await injectedAsyncStorage.multiSet(currentBatch.map(item => [item.key, item.value]));
    } else {
      // Fall back to individual sets
      for (const item of currentBatch) {
        await injectedAsyncStorage.setItem(item.key, item.value);
      }
    }

    // Mark cache items as clean
    for (const item of currentBatch) {
      if (memoryCache[item.key]) {
        memoryCache[item.key].dirty = false;
      }
    }
  } catch (error) {
    // Keep items in memory cache even if AsyncStorage fails
  }
}

// Periodically clean up expired cache items
function cleanupExpiredCache(): void {
  const now = Date.now();

  for (const key in memoryCache) {
    if (now - memoryCache[key].timestamp > DEFAULT_CACHE_EXPIRATION) {
      // Don't remove dirty items
      if (!memoryCache[key].dirty) {
        delete memoryCache[key];
      }
    }
  }
}

// Set up periodic cache cleanup
const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes
setInterval(cleanupExpiredCache, CLEANUP_INTERVAL);

// Preload frequent items on module load
SafeStorage.preloadFrequentItems();

/**
 * Class for handling storage messages between WebView and React Native
 */
export class StorageHandler {
  /**
   * Safe get item - uses memory cache first, falls back to AsyncStorage
   */
  private static async safeGetItem(key: string): Promise<string | null> {
    // Replace [object Promise] with a valid key if it occurs
    const safeKey = key.includes('[object Promise]')
      ? key.replace('[object Promise]', 'UnresolvedPromise')
      : key;

    try {
      // Track access for potential preloading
      keyAccessCount[safeKey] = (keyAccessCount[safeKey] || 0) + 1;

      return await SafeStorage.getItem(safeKey);
    } catch (error) {
      // Try memory cache as fallback
      return memoryCache[safeKey]?.value || null;
    }
  }

  /**
   * Safe set item - updates memory cache and queues for AsyncStorage
   */
  private static async safeSetItem(key: string, value: string): Promise<boolean> {
    // Replace [object Promise] with a valid key if it occurs
    const safeKey = key.includes('[object Promise]')
      ? key.replace('[object Promise]', 'UnresolvedPromise')
      : key;

    try {
      return await SafeStorage.setItem(safeKey, value);
    } catch (error) {
      return false;
    }
  }

  /**
   * Clears all SDK cache (memory cache and AsyncStorage data with storysdk prefix)
   * Call this when you need to completely reset SDK state
   */
  static async clearCache(): Promise<void> {
    try {
      // Clear memory cache
      Object.keys(memoryCache).forEach(key => {
        delete memoryCache[key];
      });

      // Clear access counts
      Object.keys(keyAccessCount).forEach(key => {
        delete keyAccessCount[key];
      });

      // Clear frequently accessed keys
      frequentlyAccessedKeys.clear();

      // Clear write queue
      writeQueue.length = 0;

      // Clear batch timeout
      if (batchWriteTimeout) {
        clearTimeout(batchWriteTimeout);
        batchWriteTimeout = null;
      }

      // Clear memory storage fallback
      Object.keys(memoryStorage).forEach(key => {
        delete memoryStorage[key];
      });

      // Clear AsyncStorage data with storysdk prefix
      if (injectedAsyncStorage) {
        try {
          // For now we'll clear items by known prefixes
          // In a real implementation, you might want to get all keys first
          const prefixesToClear = [
            'storysdk:onboarding:completed:',
            'storysdk:script:',
            'storysdk:css:',
            'storysdk:data:',
            'storysdk:cache:'
          ];

          // Note: This is a simplified approach. In a production environment,
          // you might want to implement getAllKeys() to find all storysdk keys
          for (const prefix of prefixesToClear) {
            // This is a placeholder - actual implementation would require
            // getting all keys and filtering by prefix
          }
        } catch (error) {
          // Silently fail AsyncStorage clearing - memory cache is already cleared
        }
      }
    } catch (error) {
      // Silently fail - at least memory cache should be cleared
    }
  }

  /**
   * Clears cache entries that match a specific prefix
   * @param prefix - The prefix to match for cache clearing
   */
  static async clearCacheByPrefix(prefix: string): Promise<void> {
    try {
      // Clear memory cache entries with matching prefix
      Object.keys(memoryCache).forEach(key => {
        if (key.startsWith(prefix)) {
          delete memoryCache[key];
        }
      });

      // Clear access counts for matching keys
      Object.keys(keyAccessCount).forEach(key => {
        if (key.startsWith(prefix)) {
          delete keyAccessCount[key];
        }
      });

      // Remove matching keys from frequently accessed set
      Array.from(frequentlyAccessedKeys).forEach(key => {
        if (key.startsWith(prefix)) {
          frequentlyAccessedKeys.delete(key);
        }
      });

      // Clear memory storage fallback entries with matching prefix
      Object.keys(memoryStorage).forEach(key => {
        if (key.startsWith(prefix)) {
          delete memoryStorage[key];
        }
      });

      // Clear from write queue
      for (let i = writeQueue.length - 1; i >= 0; i--) {
        if (writeQueue[i].key.startsWith(prefix)) {
          writeQueue.splice(i, 1);
        }
      }

      // Clear AsyncStorage data with matching prefix
      if (injectedAsyncStorage) {
        try {
          // Note: This is a simplified approach. In a production environment,
          // you might want to implement getAllKeys() to find all matching keys
          // For now, we'll just clear the memory caches
        } catch (error) {
          // Silently fail AsyncStorage clearing
        }
      }
    } catch (error) {
      // Silently fail
    }
  }

  /**
   * Handles incoming messages from WebView related to storage
   * @param message Message from WebView
   * @param sendResponse Function to send a response back to WebView
   * @returns true if the message was handled, false otherwise
   */
  static async handleMessage(message: any, sendResponse: (message: string) => void): Promise<boolean> {
    try {
      const parsedMessage: StorageMessage = typeof message === 'string' ? JSON.parse(message) : message;

      // Processing requests to get data from storage
      if (parsedMessage.type === 'storysdk:storage:get') {
        const { key } = parsedMessage.data;
        const callbackId = parsedMessage.callbackId;

        if (!key) {
          return false;
        }

        try {
          const value = await this.safeGetItem(key);
          let parsedValue = null;

          if (value !== null) {
            try {
              parsedValue = JSON.parse(value);
            } catch {
              // If failed to parse JSON, use the value as is
              parsedValue = value;
            }
          }

          sendResponse(JSON.stringify({
            type: 'storysdk:storage:response',
            callbackId: callbackId,
            data: {
              key,
              value: parsedValue
            }
          }));

          return true;
        } catch (error) {
          sendResponse(JSON.stringify({
            type: 'storysdk:storage:response',
            callbackId: callbackId,
            data: {
              key,
              value: null,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }));

          return true;
        }
      }

      // Processing requests to save data to storage
      if (parsedMessage.type === 'storysdk:storage:set') {
        const { key, value } = parsedMessage.data;
        const callbackId = parsedMessage.callbackId;

        if (!key) {
          return false;
        }

        try {
          // Convert value to JSON string if it's not a string
          const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
          const success = await this.safeSetItem(key, stringValue);

          sendResponse(JSON.stringify({
            type: 'storysdk:storage:response',
            callbackId: callbackId,
            data: {
              key,
              success
            }
          }));

          return true;
        } catch (error) {
          sendResponse(JSON.stringify({
            type: 'storysdk:storage:response',
            callbackId: callbackId,
            data: {
              key,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }));

          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Flush all pending writes to AsyncStorage
   * Call this method when app is going to background or before a critical operation
   */
  static async flushWrites(): Promise<void> {
    await SafeStorage.flushWrites();
  }

  /**
   * Preloads specific keys into memory cache
   * @param keys Array of keys to preload
   */
  static async preloadKeys(keys: string[]): Promise<void> {
    if (!injectedAsyncStorage || keys.length === 0) {
      return;
    }

    try {
      if (injectedAsyncStorage.multiGet) {
        const multiResult = await injectedAsyncStorage.multiGet(keys);

        if (multiResult) {
          const now = Date.now();
          multiResult.forEach(([key, value]) => {
            if (value !== null) {
              memoryCache[key] = {
                value,
                timestamp: now
              };
            }
          });
        }
      }
    } catch (error) {
      // Silently fail preloading - it's just an optimization
    }
  }
} 