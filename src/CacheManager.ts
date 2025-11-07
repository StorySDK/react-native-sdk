import { StorageHandler } from './StorageHandler';

// Extend the window interface to include ReactNativeWebView
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

/**
 * Simplified cache manager for StorySDK
 * Handles tokens and data caching for stories and groups
 * 
 * CACHE KEYS REFERENCE:
 * 
 * React Native SDK Cache Keys:
 * - `storysdk:token:${componentType}` - Stored tokens per component
 * - `storysdk:cache:version` - Cache version for compatibility
 * - `storysdk:${componentType}:${tokenHash}:${dataType}` - Component data cache
 * - `storysdk:${componentType}:${tokenHash}:${dataType}:meta` - Cache metadata
 * 
 * TROUBLESHOOTING:
 * 
 * Cache clearing options (in order of aggressiveness):
 * ```ts
 * // Clear cache for specific component and token
 * await CacheManager.clearComponentCache('groups', 'TOKEN');
 * 
 * // Clear all cache for specific token
 * await CacheManager.clearTokenCache('TOKEN');
 * 
 * // Clear all SDK cache (nuclear option)
 * await CacheManager.clearAllCache();
 * ```
 */
export class CacheManager {
  // Token management
  private static currentTokens: Map<string, string> = new Map(); // componentType -> token
  private static readonly TOKEN_STORAGE_PREFIX = 'storysdk:token:';

  // Debug mode
  private static debugMode: boolean = false;

  // Cache versioning
  private static readonly CACHE_VERSION_KEY = 'storysdk:cache:version';
  private static readonly CURRENT_CACHE_VERSION = '1.0.0';

  // Data cache
  private static readonly DATA_CACHE_PREFIX = 'storysdk:';
  private static readonly CURRENT_DATA_VERSION = '1.0.0';

  // ============= TOKEN MANAGEMENT =============

  /**
   * Initializes SDK component with a token and manages cache appropriately
   * @param componentType - Component type ('groups' or 'modal')
   * @param token - The token to use
   * @returns Promise<boolean> - true if cache was cleared due to token change
   */
  static async initializeWithToken(componentType: string, token: string): Promise<boolean> {
    try {
      // Check cache version first
      await this.checkCacheVersion();

      const previousToken = await this.getPreviousToken(componentType);
      let cacheCleared = false;

      // If token has changed for this component, clear component-specific cache
      if (previousToken && previousToken !== token) {
        this.debugLog(`Token changed for ${componentType}: '${previousToken}' -> '${token}', clearing component cache...`);

        // Clear cache for the old token
        await this.clearComponentCache(componentType, previousToken);

        // Force flush writes to ensure the cache is truly cleared
        await StorageHandler.flushWrites();

        cacheCleared = true;
      } else if (previousToken) {
        this.debugLog(`Token unchanged for ${componentType}: '${previousToken}' === '${token}', skipping cache clear`);
      } else {
        this.debugLog(`No previous token found for ${componentType}, storing '${token}' for first time`);
      }

      // Update current token for this component
      this.currentTokens.set(componentType, token);

      // Store the new token for this component
      await this.storeTokenForComponent(componentType, token);

      return cacheCleared;
    } catch (error) {
      console.warn(`Error during token initialization for ${componentType}:`, error);

      // Fallback: store token and clear component cache on error
      this.currentTokens.set(componentType, token);
      await this.storeTokenForComponent(componentType, token);

      // In case of error, clear cache to be safe
      const previousToken = await this.getPreviousToken(componentType);
      if (previousToken) {
        await this.clearComponentCache(componentType, previousToken);
      }
      await this.clearComponentCache(componentType, token);

      return true;
    }
  }

  /**
   * Gets information about current tokens for all components
   */
  static getComponentTokensInfo(): { [componentType: string]: string } {
    const result: { [componentType: string]: string } = {};
    this.currentTokens.forEach((token, componentType) => {
      result[componentType] = token;
    });
    return result;
  }

  // ============= DATA MANAGEMENT =============

  /**
   * Stores data in cache with TTL
   */
  static async setData(
    componentType: string,
    token: string,
    dataType: string,
    data: any,
    ttl: number = 5 * 60 * 1000 // 5 minutes default TTL
  ): Promise<boolean> {
    try {
      const cacheKey = this.getDataCacheKey(componentType, token, dataType);
      const metadataKey = this.getDataMetadataKey(componentType, token, dataType);

      const cacheData = {
        data,
        timestamp: Date.now(),
        version: this.CURRENT_DATA_VERSION,
      };

      const metadata = {
        ttl,
        timestamp: Date.now(),
        expires: Date.now() + ttl,
      };

      await this.setItem(cacheKey, JSON.stringify(cacheData));
      await this.setItem(metadataKey, JSON.stringify(metadata));

      return true;
    } catch (error) {
      console.warn('Failed to set cache data:', error);
      return false;
    }
  }

  /**
   * Retrieves data from cache
   */
  static async getData(
    componentType: string,
    token: string,
    dataType: string
  ): Promise<any | null> {
    try {
      const cacheKey = this.getDataCacheKey(componentType, token, dataType);
      const metadataKey = this.getDataMetadataKey(componentType, token, dataType);

      const [cacheDataStr, metadataStr] = await Promise.all([
        this.getItem(cacheKey),
        this.getItem(metadataKey),
      ]);

      if (!cacheDataStr || !metadataStr) {
        return null;
      }

      const metadata = JSON.parse(metadataStr);

      // Check if data has expired
      if (Date.now() > metadata.expires) {
        // Clean up expired data
        await this.removeData(componentType, token, dataType);
        return null;
      }

      const cacheData = JSON.parse(cacheDataStr);
      return cacheData.data;
    } catch (error) {
      console.warn('Failed to get cache data:', error);
      return null;
    }
  }

  /**
   * Removes specific data from cache
   */
  static async removeData(componentType: string, token: string, dataType: string): Promise<void> {
    try {
      const cacheKey = this.getDataCacheKey(componentType, token, dataType);
      const metadataKey = this.getDataMetadataKey(componentType, token, dataType);

      await Promise.all([
        this.removeItem(cacheKey),
        this.removeItem(metadataKey),
      ]);
    } catch (error) {
      console.warn('Failed to remove cache data:', error);
    }
  }

  /**
   * Checks if data exists in cache
   */
  static async hasData(componentType: string, token: string, dataType: string): Promise<boolean> {
    try {
      const data = await this.getData(componentType, token, dataType);
      return data !== null;
    } catch (error) {
      return false;
    }
  }

  // ============= CACHE CLEARING OPERATIONS =============

  /**
   * Clears all cache for specific component and token
   */
  static async clearComponentCache(componentType: string, token: string): Promise<void> {
    try {
      this.debugLog(`Clearing cache for component ${componentType} with token hash: ${this.hashString(token)}`);

      const tokenHash = this.hashString(token);

      // Clear component-specific cache
      const componentCachePrefix = `storysdk:${componentType}:${tokenHash}:`;
      await StorageHandler.clearCacheByPrefix(componentCachePrefix);

      // Clear WebView cache for this token
      await this.clearWebViewCache(token);

      // Force flush to ensure all changes are persisted
      await StorageHandler.flushWrites();

      this.debugLog(`Cache clearing completed for ${componentType} with token`);
    } catch (error) {
      console.warn(`Failed to clear cache for ${componentType} with token:`, error);
    }
  }

  /**
   * Clears all data cache for specific token across all components
   */
  static async clearTokenCache(token: string): Promise<void> {
    try {
      const componentTypes = ['groups', 'modal'];

      for (const componentType of componentTypes) {
        await this.clearComponentCache(componentType, token);
      }
    } catch (error) {
      console.warn('Failed to clear token cache:', error);
    }
  }

  /**
   * Clears all SDK cache (all components, all tokens, all data)
   * @param preserveTokens - If true, preserves stored tokens for change detection
   */
  static async clearAllCache(preserveTokens: boolean = false): Promise<void> {
    try {
      // Clear all data cache
      await StorageHandler.clearCacheByPrefix(this.DATA_CACHE_PREFIX);

      // Clear general StorageHandler cache
      await StorageHandler.clearCache();

      // Clear token mappings in memory
      this.currentTokens.clear();

      // Only clear stored tokens if explicitly requested
      if (!preserveTokens) {
        await StorageHandler.clearCacheByPrefix(this.TOKEN_STORAGE_PREFIX);
      }

      // Clear WebView cache
      await this.clearAllWebViewCache();
    } catch (error) {
      console.warn('Failed to clear all cache:', error);
    }
  }

  /**
   * Flush pending writes to storage
   */
  static async flushWrites(): Promise<void> {
    try {
      await StorageHandler.flushWrites();
    } catch (error) {
      console.warn('Failed to flush writes:', error);
    }
  }

  // ============= WEBVIEW CACHE MANAGEMENT =============

  /**
   * Forces WebView reload with cache clearing
   */
  static async forceWebViewReload(): Promise<void> {
    return new Promise((resolve) => {
      try {
        if (typeof window !== 'undefined' && window.ReactNativeWebView) {
          const message = {
            type: 'storysdk:cache:clear:webview',
            data: { reload: true }
          };

          window.ReactNativeWebView.postMessage(JSON.stringify(message));

          // Give some time for the message to be processed
          setTimeout(() => {
            resolve();
          }, 100);
        } else {
          resolve();
        }
      } catch (error) {
        console.warn('Error forcing WebView reload:', error);
        resolve();
      }
    });
  }

  private static async clearWebViewCache(token: string): Promise<void> {
    return new Promise((resolve) => {
      try {
        if (typeof window !== 'undefined' && window.ReactNativeWebView) {
          const tokenHash = this.hashString(token);
          const message = {
            type: 'storysdk:cache:clear',
            data: { tokenHash }
          };

          window.ReactNativeWebView.postMessage(JSON.stringify(message));

          // Give some time for the message to be processed
          setTimeout(() => {
            resolve();
          }, 100);
        } else {
          resolve();
        }
      } catch (error) {
        console.warn('Error clearing WebView cache:', error);
        resolve();
      }
    });
  }

  private static async clearAllWebViewCache(): Promise<void> {
    return new Promise((resolve) => {
      try {
        if (typeof window !== 'undefined' && window.ReactNativeWebView) {
          const message = {
            type: 'storysdk:cache:clear:all',
            data: {}
          };

          window.ReactNativeWebView.postMessage(JSON.stringify(message));

          // Give some time for the message to be processed
          setTimeout(() => {
            resolve();
          }, 100);
        } else {
          resolve();
        }
      } catch (error) {
        console.warn('Error clearing all WebView cache:', error);
        resolve();
      }
    });
  }

  // ============= PRIVATE HELPER METHODS =============

  private static getDataCacheKey(componentType: string, token: string, dataType: string): string {
    const tokenHash = this.hashString(token);
    return `${this.DATA_CACHE_PREFIX}${componentType}:${tokenHash}:${dataType}`;
  }

  private static getDataMetadataKey(componentType: string, token: string, dataType: string): string {
    const tokenHash = this.hashString(token);
    return `${this.DATA_CACHE_PREFIX}${componentType}:${tokenHash}:${dataType}:meta`;
  }

  private static async getPreviousToken(componentType: string): Promise<string | null> {
    try {
      const key = `${this.TOKEN_STORAGE_PREFIX}${componentType}`;
      return await this.getItem(key);
    } catch (error) {
      return null;
    }
  }

  private static async storeTokenForComponent(componentType: string, token: string): Promise<void> {
    try {
      const key = `${this.TOKEN_STORAGE_PREFIX}${componentType}`;
      await this.setItem(key, token);
    } catch (error) {
      console.warn('Failed to store token for component:', error);
    }
  }

  private static async checkCacheVersion(): Promise<void> {
    try {
      const currentVersion = await this.getCacheVersion();
      if (currentVersion !== this.CURRENT_CACHE_VERSION) {
        this.debugLog('Cache version mismatch, clearing cache but preserving tokens');
        // Clear all cache on version mismatch but preserve tokens for change detection
        await this.clearAllCache(true); // preserve tokens
        await this.setCacheVersion(this.CURRENT_CACHE_VERSION);
      }
    } catch (error) {
      this.debugLog('Error checking cache version, clearing cache but preserving tokens');
      // On error, clear cache and set version but preserve tokens
      await this.clearAllCache(true); // preserve tokens
      await this.setCacheVersion(this.CURRENT_CACHE_VERSION);
    }
  }

  private static async getCacheVersion(): Promise<string | null> {
    try {
      return await this.getItem(this.CACHE_VERSION_KEY);
    } catch (error) {
      return null;
    }
  }

  private static async setCacheVersion(version: string): Promise<void> {
    try {
      await this.setItem(this.CACHE_VERSION_KEY, version);
    } catch (error) {
      console.warn('Failed to set cache version:', error);
    }
  }

  private static hashString(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString();
  }

  private static async getItem(key: string): Promise<string | null> {
    return new Promise((resolve) => {
      const message = {
        type: 'storysdk:storage:get',
        callbackId: `callback_${Date.now()}_${Math.random()}`,
        data: { key }
      };

      const handleResponse = (response: string) => {
        try {
          const parsedResponse = JSON.parse(response);
          if (parsedResponse.callbackId === message.callbackId) {
            resolve(parsedResponse.data.value || null);
          }
        } catch (error) {
          resolve(null);
        }
      };

      StorageHandler.handleMessage(message, handleResponse);
    });
  }

  private static async setItem(key: string, value: string): Promise<boolean> {
    return new Promise((resolve) => {
      const message = {
        type: 'storysdk:storage:set',
        callbackId: `callback_${Date.now()}_${Math.random()}`,
        data: { key, value }
      };

      const handleResponse = (response: string) => {
        try {
          const parsedResponse = JSON.parse(response);
          if (parsedResponse.callbackId === message.callbackId) {
            resolve(parsedResponse.data.success || false);
          }
        } catch (error) {
          resolve(false);
        }
      };

      StorageHandler.handleMessage(message, handleResponse);
    });
  }

  private static async removeItem(key: string): Promise<boolean> {
    return new Promise((resolve) => {
      const message = {
        type: 'storysdk:storage:set',
        callbackId: `callback_${Date.now()}_${Math.random()}`,
        data: { key, value: null } // Setting to null removes the item
      };

      const handleResponse = (response: string) => {
        try {
          const parsedResponse = JSON.parse(response);
          if (parsedResponse.callbackId === message.callbackId) {
            resolve(parsedResponse.data.success || false);
          }
        } catch (error) {
          resolve(false);
        }
      };

      StorageHandler.handleMessage(message, handleResponse);
    });
  }

  // ============= DEBUG UTILITIES =============

  static setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  static getDebugMode(): boolean {
    return this.debugMode;
  }

  private static debugLog(message: string, ...args: any[]): void {
    if (this.debugMode) {
      console.log(`[CacheManager] ${message}`, ...args);
    }
  }
} 