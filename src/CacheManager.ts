import { StorageHandler } from './StorageHandler';

/**
 * Unified cache manager for StorySDK
 * Handles tokens, data caching, and onboarding completion state
 * 
 * WEB SDK CACHE KEYS REFERENCE:
 * 
 * The following cache keys are used in the Web SDK (localStorage):
 * 
 * 1. API Cache (server responses with Last-Modified headers):
 *    - `storysdk_api_cache_${token}_/app` - App configuration data
 *    - `storysdk_api_cache_${token}_/groups` - Groups list data
 *    - `storysdk_api_cache_${token}_/groups/${groupId}/stories` - Stories for specific group
 * 
 * 2. User Identity Cache:
 *    - `storysdk_user_id` - Current user ID format (React SDK)
 * 
 * 3. Adapted Data Cache (processed data ready for UI):
 *    - `storysdk_adapted_${token}_${language}_${userId}` - Processed stories data (new format)
 *    - `storysdk_adapted_${token}_${language}_${userId}_groups_only` - Groups-only adapted data
 *    - `storysdk_adapted_${token}_${language}_${userId}_with_stories` - Groups with stories
 *    - `storysdk_adapted_data_${token}_${language}_${userId}` - Legacy adapted data format
 * 
 * 4. Groups Cache:
 *    - `storysdk_groups_${token}_${language}_${userId}` - Raw groups data
 * 
 * 5. Stories Cache:
 *    - `storysdk_stories_${token}_${language}_${userId}_group_${groupId}` - Stories for specific group
 * 
 * 6. App Cache:
 *    - `storysdk_app_${token}_${language}_${userId}` - App configuration
 * 
 * 7. React Native WebView Script/CSS Cache:
 *    - `storysdk:script:${bundleVersion}` - Cached JavaScript bundle (global)
 *    - `storysdk:css:${bundleVersion}` - Cached CSS bundle (global)
 *    - `storysdk:script:${bundleVersion}:${tokenHash}` - Token-specific script cache
 *    - `storysdk:css:${bundleVersion}:${tokenHash}` - Token-specific CSS cache
 * 
 * 8. React Native SDK Cache Keys (managed by this CacheManager):
 *    - `storysdk:token:${componentType}` - Stored tokens per component
 *    - `storysdk:cache:version` - Cache version for compatibility
 *    - `storysdk:${componentType}:${tokenHash}:${dataType}` - Component data cache
 *    - `storysdk:${componentType}:${tokenHash}:${dataType}:meta` - Cache metadata
 *    - `storysdk:onboarding:completed:${tokenHash}:${onboardingId}` - Onboarding completion
 * 
 * TROUBLESHOOTING CACHE ISSUES:
 * 
 * If you're experiencing issues with old cache being returned after token change:
 * 
 * 1. Check if cache is properly cleared:
 *    ```ts
 *    const diagnostics = await CacheManager.diagnoseCacheState('groups', 'NEW_TOKEN');
 *    console.log('Cache diagnostics:', diagnostics);
 *    ```
 * 
 * 2. Manual cache clearing (in order of aggressiveness):
 *    ```ts
 *    // Clear all cache for specific component and token (includes WebView resources & reload)
 *    await CacheManager.clearComponentTokenCache('groups', 'OLD_TOKEN');
 *    
 *    // Clear all data for specific token across components
 *    await CacheManager.clearTokenDataCache('OLD_TOKEN');
 *    
 *    // Clear all SDK cache including WebView resources (nuclear option)
 *    await CacheManager.clearAllCache();
 *    
 *    // Aggressive cache clearing with WebView resources (if standard methods don't work)
 *    await CacheManager.clearAllCacheAggressive();
 *    
 *    // Force WebView reload with cache clearing (when UI doesn't update properly)
 *    await CacheManager.forceWebViewReload();
 *    
 *    // MOST AGGRESSIVE: Complete WebView reset with hard reload (last resort)
 *    await CacheManager.forceCompleteWebViewReset();
 *    ```
 * 
 * 3. Verify token initialization:
 *    ```ts
 *    const cacheCleared = await CacheManager.initializeWithToken('groups', 'NEW_TOKEN');
 *    if (cacheCleared) {
 *      console.log('Cache was cleared due to token change');
 *    }
 *    ```
 * 
 * Note: Token changes now automatically trigger aggressive WebView cache clearing including:
 * - localStorage/sessionStorage clearing
 * - Script and stylesheet cache busting
 * - Service Worker cache clearing
 * - Hard WebView reload
 * This ensures complete content refresh when switching between different tokens.
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

  // Onboarding storage
  private static readonly ONBOARDING_PREFIX = 'storysdk:onboarding:completed:';

  // ============= TOKEN MANAGEMENT =============

  /**
   * Initializes SDK component with a token and manages cache appropriately
   * Supports both legacy single-token mode and new component-specific mode
   * @param componentTypeOrToken - Component type (string) or token (string) for legacy compatibility
   * @param newToken - The new token to use (only when first param is componentType)
   * @returns Promise<boolean> - true if cache was cleared due to token change
   */
  static async initializeWithToken(componentTypeOrToken: string, newToken?: string): Promise<boolean> {
    try {
      // Determine if this is legacy call (only token) or new call (componentType + token)
      const componentType = newToken ? componentTypeOrToken : 'default';
      const token = newToken || componentTypeOrToken;

      // Check cache version first
      await this.checkCacheVersion();

      const previousToken = await this.getPreviousToken(componentType);
      let cacheCleared = false;

      // If token has changed for this component, clear component-specific cache
      if (previousToken && previousToken !== token) {
        this.debugLog(`Token changed for ${componentType}, clearing component cache...`);

        // Clear cache for the old token
        await this.clearComponentTokenCache(componentType, previousToken);

        // Also clear any cross-component data that might reference the old token
        await this.clearTokenDataCache(previousToken);

        // Force flush writes to ensure the cache is truly cleared
        await StorageHandler.flushWrites();

        cacheCleared = true;
      }

      // Update current token for this component
      this.currentTokens.set(componentType, token);

      // Store the new token for this component
      await this.storeTokenForComponent(componentType, token);

      return cacheCleared;
    } catch (error) {
      const componentType = newToken ? componentTypeOrToken : 'default';
      const token = newToken || componentTypeOrToken;

      console.warn(`Error during token initialization for ${componentType}:`, error);

      // Fallback: store token and clear component cache on error
      this.currentTokens.set(componentType, token);
      await this.storeTokenForComponent(componentType, token);

      // In case of error, clear cache for both old and new token to be safe
      const previousToken = await this.getPreviousToken(componentType);
      if (previousToken) {
        await this.clearComponentTokenCache(componentType, previousToken);
      }
      await this.clearComponentTokenCache(componentType, token);

      return true;
    }
  }

  /**
   * Gets the current token for a component
   * @deprecated This method returns cached token. Use token from props instead to ensure you always get the actual token value.
   * Tokens should not be cached and should always be taken from component props.
   */
  static getCurrentToken(componentType: string = 'default'): string | null {
    console.warn(
      `CacheManager.getCurrentToken() is deprecated. ` +
      `Token should be taken from component props instead of cache to ensure actual value is used. ` +
      `Component type: ${componentType}`
    );
    return this.currentTokens.get(componentType) || null;
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

  /**
   * Checks if multiple components are using the same token
   */
  static hasTokenConflicts(): boolean {
    const tokens = Array.from(this.currentTokens.values());
    const uniqueTokens = new Set(tokens);
    return tokens.length > uniqueTokens.size;
  }

  // ============= DATA CACHE MANAGEMENT =============

  /**
   * Stores data in cache with metadata and TTL
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

      const metadata = {
        timestamp: Date.now(),
        ttl,
        version: this.CURRENT_DATA_VERSION
      };

      // Store data and metadata
      const dataStored = await this.setItem(cacheKey, JSON.stringify(data));
      const metadataStored = await this.setItem(metadataKey, JSON.stringify(metadata));

      return dataStored && metadataStored;
    } catch (error) {
      console.warn('Failed to cache data:', error);
      return false;
    }
  }

  /**
   * Gets data from cache if valid (not expired and correct version)
   */
  static async getData(
    componentType: string,
    token: string,
    dataType: string
  ): Promise<any | null> {
    try {
      const cacheKey = this.getDataCacheKey(componentType, token, dataType);
      const metadataKey = this.getDataMetadataKey(componentType, token, dataType);

      // Get metadata first
      const metadataStr = await this.getItem(metadataKey);
      if (!metadataStr) {
        return null;
      }

      const metadata = JSON.parse(metadataStr);

      // Check if data is expired
      const now = Date.now();
      if (now - metadata.timestamp > metadata.ttl) {
        await this.removeData(componentType, token, dataType);
        return null;
      }

      // Check version compatibility
      if (metadata.version !== this.CURRENT_DATA_VERSION) {
        await this.removeData(componentType, token, dataType);
        return null;
      }

      // Get actual data
      const dataStr = await this.getItem(cacheKey);
      if (!dataStr) {
        return null;
      }

      return JSON.parse(dataStr);
    } catch (error) {
      console.warn('Failed to get cached data:', error);
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

      await this.removeItem(cacheKey);
      await this.removeItem(metadataKey);
    } catch (error) {
      console.warn('Failed to remove cached data:', error);
    }
  }

  /**
   * Checks if data exists in cache (without checking expiration)
   */
  static async hasData(componentType: string, token: string, dataType: string): Promise<boolean> {
    try {
      const cacheKey = this.getDataCacheKey(componentType, token, dataType);
      const data = await this.getItem(cacheKey);
      return data !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Preloads cache for specific component and token
   */
  static async preloadCache(componentType: string, token: string, dataTypes: string[]): Promise<void> {
    try {
      const keys: string[] = [];

      for (const dataType of dataTypes) {
        keys.push(this.getDataCacheKey(componentType, token, dataType));
        keys.push(this.getDataMetadataKey(componentType, token, dataType));
      }

      await StorageHandler.preloadKeys(keys);
    } catch (error) {
      console.warn('Failed to preload cache:', error);
    }
  }

  // ============= ONBOARDING MANAGEMENT =============

  /**
   * Checks if onboarding was completed
   */
  static async isOnboardingCompleted(token: string, onboardingId: string): Promise<boolean> {
    try {
      const key = this.getOnboardingStorageKey(token, onboardingId);
      const value = await this.getItem(key);
      return value === 'true';
    } catch (error) {
      return false;
    }
  }

  /**
   * Marks onboarding as completed
   */
  static async markOnboardingCompleted(token: string, onboardingId: string): Promise<void> {
    try {
      const key = this.getOnboardingStorageKey(token, onboardingId);
      await this.setItem(key, 'true');
    } catch (error) {
      console.warn('Failed to save onboarding completion status:', error);
    }
  }

  /**
   * Resets onboarding completion state (for testing/debugging)
   */
  static async resetOnboardingCompletion(token: string, onboardingId: string): Promise<void> {
    try {
      const key = this.getOnboardingStorageKey(token, onboardingId);
      await this.setItem(key, 'false');
    } catch (error) {
      console.warn('Failed to reset onboarding completion status:', error);
    }
  }

  /**
   * Preloads onboarding keys for better performance
   */
  static async preloadOnboardings(token: string, onboardingIds: string[]): Promise<void> {
    const keys = onboardingIds.map(id => this.getOnboardingStorageKey(token, id));
    await StorageHandler.preloadKeys(keys);
  }

  // ============= CACHE CLEARING OPERATIONS =============

  /**
   * Clears cache for specific component and current token
   * @deprecated This method relies on cached token. Use clearComponentTokenCache(componentType, token) instead with explicit token from props.
   */
  static async clearCurrentTokenCache(componentType: string = 'default'): Promise<void> {
    console.warn(
      `CacheManager.clearCurrentTokenCache() is deprecated. ` +
      `Use clearComponentTokenCache(componentType, token) instead with explicit token from props. ` +
      `Component type: ${componentType}`
    );
    const currentToken = this.currentTokens.get(componentType);
    if (currentToken) {
      await this.clearComponentTokenCache(componentType, currentToken);
    } else {
      console.warn(`No cached token found for component type: ${componentType}. Cannot clear cache.`);
    }
  }

  /**
   * Clears all cache for specific component and token
   */
  static async clearComponentTokenCache(componentType: string, token: string): Promise<void> {
    try {
      this.debugLog(`Clearing cache for component ${componentType} with token hash: ${this.hashString(token)}`);

      // Clear data cache for this component and token
      await this.clearComponentTokenDataCache(componentType, token);

      // Clear StorageHandler cache with multiple patterns to ensure complete cleanup
      const tokenHash = this.hashString(token);

      // Clear component-specific cache
      const componentCachePrefix = `storysdk:${componentType}:${tokenHash}:`;
      await StorageHandler.clearCacheByPrefix(componentCachePrefix);

      // Clear generic token cache
      const tokenCachePrefix = `storysdk:${tokenHash}:`;
      await StorageHandler.clearCacheByPrefix(tokenCachePrefix);

      // Clear onboarding cache for this token (regardless of component type)
      await this.clearOnboardingTokenCache(token);

      // Clear groups-specific cache (regardless of component type)
      const groupsCachePrefix = `storysdk:groups:${tokenHash}:`;
      await StorageHandler.clearCacheByPrefix(groupsCachePrefix);

      // Clear modal-specific cache (regardless of component type)
      const modalCachePrefix = `storysdk:modal:${tokenHash}:`;
      await StorageHandler.clearCacheByPrefix(modalCachePrefix);

      // AGGRESSIVE WebView cache clearing when token changes
      this.debugLog('Performing aggressive WebView cache clearing for token change...');

      // Clear WebView localStorage cache for this token
      await this.clearWebViewCache(token);

      // Clear WebView resources cache (scripts, styles, images, etc.)
      await this.clearWebViewResourcesCache();

      // Force complete WebView reset to ensure fresh content loading
      await this.forceWebViewReload();

      // Force flush to ensure all changes are persisted
      await StorageHandler.flushWrites();

      this.debugLog(`Aggressive cache clearing completed for ${componentType} with token`);
    } catch (error) {
      console.warn(`Failed to clear cache for ${componentType} with token:`, error);

      // Even if some operations fail, try to force complete reset as fallback
      try {
        this.debugLog('Fallback: attempting complete WebView reset...');
        await this.forceCompleteWebViewReset();
      } catch (fallbackError) {
        console.warn('Fallback complete reset also failed:', fallbackError);
      }
    }
  }

  /**
   * Clears data cache for specific component and token
   */
  static async clearComponentTokenDataCache(componentType: string, token: string): Promise<void> {
    try {
      const tokenHash = this.hashString(token);
      const prefix = `${this.DATA_CACHE_PREFIX}${componentType}:${tokenHash}:`;
      await StorageHandler.clearCacheByPrefix(prefix);
    } catch (error) {
      console.warn('Failed to clear component token cache:', error);
    }
  }

  /**
   * Clears all data cache for specific token across all components
   */
  static async clearTokenDataCache(token: string): Promise<void> {
    try {
      const componentTypes = ['groups', 'modal', 'onboarding'];

      for (const componentType of componentTypes) {
        await this.clearComponentTokenDataCache(componentType, token);
      }
    } catch (error) {
      console.warn('Failed to clear token cache:', error);
    }
  }

  /**
   * Clears onboarding cache for specific token
   */
  static async clearOnboardingTokenCache(token: string): Promise<void> {
    try {
      const tokenHash = this.hashString(token);
      const tokenPrefix = `${this.ONBOARDING_PREFIX}${tokenHash}:`;
      await StorageHandler.clearCacheByPrefix(tokenPrefix);
    } catch (error) {
      console.warn('Failed to clear onboarding token cache:', error);
    }
  }

  /**
   * Clears all SDK cache (all components, all tokens, all data)
   */
  static async clearAllCache(): Promise<void> {
    try {
      // Clear all data cache
      await StorageHandler.clearCacheByPrefix(this.DATA_CACHE_PREFIX);

      // Clear all onboarding cache
      await StorageHandler.clearCacheByPrefix(this.ONBOARDING_PREFIX);

      // Clear general StorageHandler cache
      await StorageHandler.clearCache();

      // Clear token mappings
      this.currentTokens.clear();

      // Clear all stored tokens
      await StorageHandler.clearCacheByPrefix(this.TOKEN_STORAGE_PREFIX);

      // Clear WebView localStorage cache
      await this.clearAllWebViewCache();

      // Clear WebView resources cache (scripts, styles, etc.)
      await this.clearWebViewResourcesCache();
    } catch (error) {
      console.warn('Failed to clear all cache:', error);
    }
  }

  /**
   * Flushes any pending writes to storage
   */
  static async flushWrites(): Promise<void> {
    await StorageHandler.flushWrites();
  }

  /**
   * Forces WebView to reload with cleared cache
   * This method clears all WebView caches and forces a complete reload
   * Use this when you need to ensure fresh content loading
   */
  static async forceWebViewReload(): Promise<void> {
    try {
      this.debugLog('Forcing WebView reload with cache clearing...');

      // Clear WebView resources cache first
      await this.clearWebViewResourcesCache();

      // Clear WebView localStorage
      await this.clearAllWebViewCache();

      // Send reload command to WebView
      const message = {
        type: 'storysdk:webview:reload',
        callbackId: `callback_${Date.now()}_${Math.random()}`,
        data: {
          clearCache: true,
          hardReload: true
        }
      };

      return new Promise((resolve) => {
        const handleResponse = (response: string) => {
          this.debugLog('WebView reload completed');
          resolve();
        };

        StorageHandler.handleMessage(message, handleResponse);
      });
    } catch (error) {
      console.warn('Failed to force WebView reload:', error);
    }
  }

  /**
   * Most aggressive cache clearing method - clears everything and forces WebView reset
   * Use this when token changes don't work properly and you need complete reset
   * This method:
   * 1. Clears all SDK cache
   * 2. Clears all WebView localStorage/sessionStorage
   * 3. Clears WebView resources cache (scripts, styles, images)
   * 4. Forces hard reload of WebView with cache busting
   */
  static async forceCompleteWebViewReset(): Promise<void> {
    try {
      this.debugLog('Starting complete WebView reset...');

      // 1. Clear all SDK cache aggressively
      await this.clearAllCacheAggressive();

      // 2. Clear WebView resources with cache busting
      await this.clearWebViewResourcesCache();

      // 3. Clear all WebView storage
      await this.clearAllWebViewCache();

      // 4. Force hard reload
      await this.forceWebViewReload();

      // 5. Wait a bit to ensure WebView has time to process
      await new Promise(resolve => setTimeout(resolve, 100));

      this.debugLog('Complete WebView reset completed');
    } catch (error) {
      console.warn('Failed to perform complete WebView reset:', error);
    }
  }

  /**
   * Forces token change with aggressive cache clearing
   * Use this when normal token initialization doesn't clear cache properly
   * @param componentType - Component type
   * @param newToken - New token to set
   * @returns Promise<void>
   */
  static async forceTokenChange(componentType: string, newToken: string): Promise<void> {
    try {
      this.debugLog(`Forcing token change for ${componentType} with aggressive cache clearing...`);

      // Get previous token if exists
      const previousToken = await this.getPreviousToken(componentType);

      // Clear cache for previous token if it exists
      if (previousToken) {
        this.debugLog(`Clearing cache for previous token...`);
        await this.clearComponentTokenCache(componentType, previousToken);
      }

      // Clear cache for new token to be extra sure
      this.debugLog(`Clearing cache for new token...`);
      await this.clearComponentTokenCache(componentType, newToken);

      // Force complete WebView reset to ensure fresh start
      await this.forceCompleteWebViewReset();

      // Update current token for this component
      this.currentTokens.set(componentType, newToken);

      // Store the new token for this component
      await this.storeTokenForComponent(componentType, newToken);

      this.debugLog(`Force token change completed for ${componentType}`);
    } catch (error) {
      console.warn(`Failed to force token change for ${componentType}:`, error);

      // Fallback: still try to set the token
      this.currentTokens.set(componentType, newToken);
      await this.storeTokenForComponent(componentType, newToken);
    }
  }

  /**
   * Aggressively clears ALL SDK cache including WebView localStorage
   * Use this when standard cache clearing doesn't work
   */
  static async clearAllCacheAggressive(): Promise<void> {
    try {
      this.debugLog('Starting aggressive cache clearing...');

      // 1. Clear all data cache
      await StorageHandler.clearCacheByPrefix(this.DATA_CACHE_PREFIX);

      // 2. Clear all onboarding cache
      await StorageHandler.clearCacheByPrefix(this.ONBOARDING_PREFIX);

      // 3. Clear general StorageHandler cache
      await StorageHandler.clearCache();

      // 4. Clear token mappings
      this.currentTokens.clear();

      // 5. Clear all stored tokens
      await StorageHandler.clearCacheByPrefix(this.TOKEN_STORAGE_PREFIX);

      // 6. Clear WebView localStorage aggressively
      await this.clearAllWebViewCache();

      // 7. Clear WebView resources cache (scripts, styles, etc.)
      await this.clearWebViewResourcesCache();

      // 8. Force flush to ensure everything is persisted
      await StorageHandler.flushWrites();

      this.debugLog('Aggressive cache clearing completed');
    } catch (error) {
      console.warn('Failed to clear all cache aggressively:', error);
    }
  }

  /**
   * Clears ALL WebView localStorage cache aggressively
   */
  private static async clearAllWebViewCache(): Promise<void> {
    try {
      const message = {
        type: 'storysdk:cache:clear:all',
        callbackId: `callback_${Date.now()}_${Math.random()}`,
        data: {
          // Clear all possible cache keys from web SDK
          patterns: [
            'storysdk_api_cache_*',        // API cache: storysdk_api_cache_{token}_{url}
            'storysdk_adapted_*',          // New adapted data cache: storysdk_adapted_{token}_{language}_{userId}*
            'storysdk_adapted_data_*',     // Legacy adapted data cache: storysdk_adapted_data_{token}_{language}_{userId}
            'storysdk_groups_*',           // Groups cache: storysdk_groups_{token}_{language}_{userId}
            'storysdk_stories_*',          // Stories cache: storysdk_stories_{token}_{language}_{userId}_group_{groupId}
            'storysdk_app_*',              // App cache: storysdk_app_{token}_{language}_{userId}
            'storysdk_user_id',            // New user ID format
            'uniq_user_id',                // Legacy user ID format
            'storysdk:script:*',           // WebView script cache
            'storysdk:css:*',              // WebView CSS cache
          ]
        }
      };

      return new Promise((resolve) => {
        const handleResponse = (response: string) => {
          resolve();
        };

        StorageHandler.handleMessage(message, handleResponse);
      });
    } catch (error) {
      console.warn('Failed to clear all WebView cache:', error);
    }
  }

  // ============= UTILITY METHODS =============

  /**
   * Gets cache statistics for debugging
   */
  static async getCacheStats(componentType?: string, token?: string): Promise<{
    totalEntries: number;
    expiredEntries: number;
    validEntries: number;
  }> {
    // Simplified version - in production you might want to maintain indices
    return {
      totalEntries: 0,
      expiredEntries: 0,
      validEntries: 0
    };
  }

  /**
   * Diagnostic method to help debug cache issues
   * Returns information about cached data for a given token
   */
  static async diagnoseCacheState(componentType: string, token: string): Promise<{
    tokenHash: string;
    currentTokens: { [key: string]: string };
    hasData: { [dataType: string]: boolean };
    cacheKeys: {
      component: string;
      token: string;
      groups: string;
      modal: string;
      onboarding: string;
    };
  }> {
    const tokenHash = this.hashString(token);
    const commonDataTypes = ['groupsList', 'story', 'modal', 'onboarding'];

    const hasData: { [dataType: string]: boolean } = {};
    for (const dataType of commonDataTypes) {
      hasData[dataType] = await this.hasData(componentType, token, dataType);
    }

    return {
      tokenHash,
      currentTokens: this.getComponentTokensInfo(),
      hasData,
      cacheKeys: {
        component: `storysdk:${componentType}:${tokenHash}:`,
        token: `storysdk:${tokenHash}:`,
        groups: `storysdk:groups:${tokenHash}:`,
        modal: `storysdk:modal:${tokenHash}:`,
        onboarding: `${this.ONBOARDING_PREFIX}${tokenHash}:`
      }
    };
  }

  // ============= PRIVATE HELPER METHODS =============

  /**
   * Generates data cache key for specific component, token and data type
   */
  private static getDataCacheKey(componentType: string, token: string, dataType: string): string {
    const tokenHash = this.hashString(token);
    return `${this.DATA_CACHE_PREFIX}${componentType}:${tokenHash}:${dataType}`;
  }

  /**
   * Generates metadata key for cached data
   */
  private static getDataMetadataKey(componentType: string, token: string, dataType: string): string {
    return `${this.getDataCacheKey(componentType, token, dataType)}:meta`;
  }

  /**
   * Gets onboarding storage key for specific token and onboarding ID
   */
  private static getOnboardingStorageKey(token: string, onboardingId: string): string {
    const tokenHash = this.hashString(token);
    return `${this.ONBOARDING_PREFIX}${tokenHash}:${onboardingId}`;
  }

  /**
   * Gets the previously stored token for a component
   */
  private static async getPreviousToken(componentType: string): Promise<string | null> {
    return new Promise((resolve) => {
      const storageKey = `${this.TOKEN_STORAGE_PREFIX}${componentType}`;
      const message = {
        type: 'storysdk:storage:get',
        callbackId: `callback_${Date.now()}_${Math.random()}`,
        data: { key: storageKey }
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

  /**
   * Stores token for specific component
   */
  private static async storeTokenForComponent(componentType: string, token: string): Promise<void> {
    return new Promise((resolve) => {
      const storageKey = `${this.TOKEN_STORAGE_PREFIX}${componentType}`;
      const message = {
        type: 'storysdk:storage:set',
        callbackId: `callback_${Date.now()}_${Math.random()}`,
        data: { key: storageKey, value: token }
      };

      const handleResponse = (response: string) => {
        resolve();
      };

      StorageHandler.handleMessage(message, handleResponse);
    });
  }

  /**
   * Checks and handles cache version compatibility
   */
  private static async checkCacheVersion(): Promise<void> {
    try {
      const storedVersion = await this.getCacheVersion();

      if (storedVersion !== this.CURRENT_CACHE_VERSION) {
        console.log('Cache version mismatch, clearing all cache...');
        await this.clearAllCache();
        await this.setCacheVersion(this.CURRENT_CACHE_VERSION);
      }
    } catch (error) {
      // On error, clear cache to be safe
      await this.clearAllCache();
      await this.setCacheVersion(this.CURRENT_CACHE_VERSION);
    }
  }

  /**
   * Gets stored cache version
   */
  private static async getCacheVersion(): Promise<string | null> {
    return new Promise((resolve) => {
      const message = {
        type: 'storysdk:storage:get',
        callbackId: `callback_${Date.now()}_${Math.random()}`,
        data: { key: this.CACHE_VERSION_KEY }
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

  /**
   * Stores cache version
   */
  private static async setCacheVersion(version: string): Promise<void> {
    return new Promise((resolve) => {
      const message = {
        type: 'storysdk:storage:set',
        callbackId: `callback_${Date.now()}_${Math.random()}`,
        data: { key: this.CACHE_VERSION_KEY, value: version }
      };

      const handleResponse = (response: string) => {
        resolve();
      };

      StorageHandler.handleMessage(message, handleResponse);
    });
  }

  /**
   * Simple string hash function for tokens
   */
  private static hashString(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(36);
  }

  /**
   * Clears WebView localStorage cache for specific token
   */
  private static async clearWebViewCache(token: string): Promise<void> {
    try {
      const tokenHash = this.hashString(token);
      const message = {
        type: 'storysdk:cache:clear',
        callbackId: `callback_${Date.now()}_${Math.random()}`,
        data: {
          token,
          tokenHash,
          // Clear specific cache keys for this token
          patterns: [
            `storysdk_api_cache_${token}_*`,       // API cache for this token
            `storysdk_adapted_${token}_*`,         // New adapted data cache for this token
            `storysdk_adapted_data_${token}_*`,    // Legacy adapted data cache for this token
            `storysdk_groups_${token}_*`,          // Groups cache for this token
            `storysdk_stories_${token}_*`,         // Stories cache for this token
            `storysdk_app_${token}_*`,             // App cache for this token
            `storysdk:script:*:${tokenHash}`,      // Token-specific script cache
            `storysdk:css:*:${tokenHash}`,         // Token-specific CSS cache
          ]
        }
      };

      return new Promise((resolve) => {
        const handleResponse = (response: string) => {
          resolve();
        };

        StorageHandler.handleMessage(message, handleResponse);
      });
    } catch (error) {
      console.warn('Failed to clear WebView cache:', error);
    }
  }

  /**
   * Clears WebView resources cache (scripts, styles, images, etc.)
   * This forces WebView to reload all resources on next load
   */
  private static async clearWebViewResourcesCache(): Promise<void> {
    try {
      const message = {
        type: 'storysdk:cache:clear:resources',
        callbackId: `callback_${Date.now()}_${Math.random()}`,
        data: {
          // Clear all types of WebView caches
          clearTypes: [
            'scripts',     // JavaScript files
            'styles',      // CSS files  
            'images',      // Image resources
            'fonts',       // Font files
            'media',       // Video/audio files
            'documents',   // HTML documents
            'all'          // All cached resources
          ]
        }
      };

      return new Promise((resolve) => {
        const handleResponse = (response: string) => {
          resolve();
        };

        StorageHandler.handleMessage(message, handleResponse);
      });
    } catch (error) {
      console.warn('Failed to clear WebView resources cache:', error);
    }
  }

  // ============= STORAGE WRAPPER METHODS =============

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
            resolve(parsedResponse.data.value);
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

  /**
   * Sets debug mode for CacheManager
   * When enabled, cache operations will log detailed information
   * @param enabled - Whether to enable debug mode
   */
  static setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * Gets current debug mode state
   */
  static getDebugMode(): boolean {
    return this.debugMode;
  }

  /**
   * Helper method for debug logging
   */
  private static debugLog(message: string, ...args: any[]): void {
    if (this.debugMode) {
      console.log(message, ...args);
    }
  }
}

// Legacy exports for backward compatibility
export const TokenManager = CacheManager;
export const OnboardingStorage = CacheManager; 