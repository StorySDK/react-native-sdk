import { StorageHandler } from './StorageHandler';

/**
 * Utilities for managing onboarding completion state
 * Uses StorageHandler for consistent storage management across the SDK
 */
export class OnboardingStorage {
  private static readonly STORAGE_PREFIX = 'storysdk:onboarding:completed:';

  /**
   * Gets storage key for specific onboarding with token and onboarding ID
   */
  private static getStorageKey(token: string, onboardingId: string): string {
    // Create a hash-like key to avoid too long storage keys
    const tokenHash = this.hashString(token);
    return `${this.STORAGE_PREFIX}${tokenHash}:${onboardingId}`;
  }

  /**
   * Simple string hash function for token
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
   * Simulates storage message for getting item through StorageHandler
   */
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

  /**
   * Simulates storage message for setting item through StorageHandler
   */
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

  /**
   * Checks if onboarding was completed
   * @param token - User/app token
   * @param onboardingId - Onboarding ID
   * @returns Promise<boolean> - true if onboarding is completed
   */
  static async isOnboardingCompleted(token: string, onboardingId: string): Promise<boolean> {
    try {
      const key = this.getStorageKey(token, onboardingId);
      const value = await this.getItem(key);
      return value === 'true';
    } catch (error) {
      // In case of error, consider onboarding as not completed
      return false;
    }
  }

  /**
   * Marks onboarding as completed
   * @param token - User/app token
   * @param onboardingId - Onboarding ID
   */
  static async markOnboardingCompleted(token: string, onboardingId: string): Promise<void> {
    try {
      const key = this.getStorageKey(token, onboardingId);
      await this.setItem(key, 'true');
    } catch (error) {
      // Silently ignore save errors
      console.warn('Failed to save onboarding completion status:', error);
    }
  }

  /**
   * Resets onboarding completion state (for testing/debugging)
   * @param token - User/app token
   * @param onboardingId - Onboarding ID
   */
  static async resetOnboardingCompletion(token: string, onboardingId: string): Promise<void> {
    try {
      const key = this.getStorageKey(token, onboardingId);
      await this.setItem(key, 'false');
    } catch (error) {
      console.warn('Failed to reset onboarding completion status:', error);
    }
  }

  /**
   * Gets list of all completed onboardings for a specific token
   * Note: This method has limited functionality when using StorageHandler
   * as it doesn't provide direct access to getAllKeys method
   * @param token - User/app token
   * @returns Promise<string[]> - array of completed onboarding IDs
   */
  static async getCompletedOnboardings(token: string): Promise<string[]> {
    // This method is limited when using StorageHandler as we don't have direct access to getAllKeys
    // For full functionality, use direct AsyncStorage access or implement a different approach
    console.warn('getCompletedOnboardings has limited functionality when using StorageHandler. Consider storing completed onboardings list separately.');
    return [];
  }

  /**
   * Gets all completed onboardings across all tokens (admin/debug function)
   * Note: This method has limited functionality when using StorageHandler
   * @returns Promise<Array<{tokenHash: string, onboardingId: string}>> - array of all completed onboardings
   */
  static async getAllCompletedOnboardings(): Promise<Array<{ tokenHash: string, onboardingId: string }>> {
    // This method is limited when using StorageHandler as we don't have direct access to getAllKeys
    console.warn('getAllCompletedOnboardings has limited functionality when using StorageHandler. Consider storing completed onboardings list separately.');
    return [];
  }

  /**
   * Preloads onboarding keys for better performance
   * @param token - User/app token
   * @param onboardingIds - Array of onboarding IDs to preload
   */
  static async preloadOnboardings(token: string, onboardingIds: string[]): Promise<void> {
    const keys = onboardingIds.map(id => this.getStorageKey(token, id));
    await StorageHandler.preloadKeys(keys);
  }

  /**
   * Flushes any pending writes to storage
   * Useful to call before app goes to background
   */
  static async flushWrites(): Promise<void> {
    await StorageHandler.flushWrites();
  }

  /**
   * Clears all cached data for a specific token
   * This removes all onboarding completion data associated with the token
   * @param token - User/app token to clear cache for
   */
  static async clearTokenCache(token: string): Promise<void> {
    try {
      const tokenHash = this.hashString(token);
      const tokenPrefix = `${this.STORAGE_PREFIX}${tokenHash}:`;

      // Clear cache entries for this token
      await StorageHandler.clearCacheByPrefix(tokenPrefix);
    } catch (error) {
      console.warn('Failed to clear token cache:', error);
    }
  }

  /**
   * Clears all SDK cache data
   * This removes all onboarding completion data across all tokens
   */
  static async clearAllCache(): Promise<void> {
    try {
      // Clear all cache entries with the onboarding prefix
      await StorageHandler.clearCacheByPrefix(this.STORAGE_PREFIX);
    } catch (error) {
      console.warn('Failed to clear all cache:', error);
    }
  }
} 