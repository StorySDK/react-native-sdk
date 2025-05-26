import { StorageHandler } from './StorageHandler';
import { OnboardingStorage } from './OnboardingStorage';

/**
 * Manager for handling token changes and cache clearing
 */
export class TokenManager {
  private static currentToken: string | null = null;
  private static readonly TOKEN_STORAGE_KEY = 'storysdk:current:token';

  /**
   * Initializes SDK with a token and clears cache if token has changed
   * @param newToken - The new token to use
   * @returns Promise<boolean> - true if cache was cleared due to token change
   */
  static async initializeWithToken(newToken: string): Promise<boolean> {
    try {
      // Get the previously stored token
      const previousToken = await StorageHandler.handleMessage(
        {
          type: 'storysdk:storage:get',
          data: { key: this.TOKEN_STORAGE_KEY }
        },
        () => { } // No-op callback for synchronous usage
      );

      const previousTokenValue = await this.getPreviousToken();

      let cacheCleared = false;

      // If token has changed, clear the cache
      if (previousTokenValue && previousTokenValue !== newToken) {
        console.log('Token changed, clearing SDK cache...');

        // Clear all cache for the previous token
        await OnboardingStorage.clearTokenCache(previousTokenValue);

        // Clear general SDK cache
        await StorageHandler.clearCache();

        cacheCleared = true;
      }

      // Update current token
      this.currentToken = newToken;

      // Store the new token
      await this.storeCurrentToken(newToken);

      return cacheCleared;
    } catch (error) {
      console.warn('Error during token initialization:', error);

      // Fallback: always clear cache on error to be safe
      this.currentToken = newToken;
      await this.storeCurrentToken(newToken);
      await StorageHandler.clearCache();

      return true;
    }
  }

  /**
   * Gets the current token
   */
  static getCurrentToken(): string | null {
    return this.currentToken;
  }

  /**
   * Manually clears cache for the current token
   */
  static async clearCurrentTokenCache(): Promise<void> {
    if (this.currentToken) {
      await OnboardingStorage.clearTokenCache(this.currentToken);
    }
  }

  /**
   * Manually clears all SDK cache
   */
  static async clearAllCache(): Promise<void> {
    await StorageHandler.clearCache();
    await OnboardingStorage.clearAllCache();
  }

  /**
   * Gets the previously stored token from storage
   */
  private static async getPreviousToken(): Promise<string | null> {
    return new Promise((resolve) => {
      const message = {
        type: 'storysdk:storage:get',
        callbackId: `callback_${Date.now()}_${Math.random()}`,
        data: { key: this.TOKEN_STORAGE_KEY }
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
   * Stores the current token to storage
   */
  private static async storeCurrentToken(token: string): Promise<void> {
    return new Promise((resolve) => {
      const message = {
        type: 'storysdk:storage:set',
        callbackId: `callback_${Date.now()}_${Math.random()}`,
        data: { key: this.TOKEN_STORAGE_KEY, value: token }
      };

      const handleResponse = (response: string) => {
        resolve();
      };

      StorageHandler.handleMessage(message, handleResponse);
    });
  }
} 