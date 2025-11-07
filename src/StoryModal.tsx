import React, { useEffect, useRef, useState, useCallback } from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, View, Modal, Platform } from 'react-native';
import sdkHtml from './sdk.html';
import { StorageHandler } from './StorageHandler';
import { CacheManager } from './CacheManager';

interface StoryModalProps {
  token: string;
  groupId?: string;
  isShowMockup?: boolean;
  isStatusBarActive?: boolean;
  arrowsColor?: string;
  backgroundColor?: string;
  isDebugMode?: boolean;
  devMode?: 'staging' | 'development';
  forbidClose?: boolean;
  autoplay?: boolean;
  isOnboarding?: boolean;
  disableCache?: boolean;
  onClose?: () => void;
  onError?: (error: { message: string, details?: string }) => void;
  onEvent?: (event: string, data: any) => void;
}

/**
 * Component for displaying stories in a modal window
 * Uses WebView to render stories and handles modal close events
 */
export const StoryModal: React.FC<StoryModalProps> = ({
  token,
  groupId,
  onClose,
  isShowMockup,
  isStatusBarActive,
  arrowsColor,
  backgroundColor,
  isDebugMode,
  devMode,
  forbidClose,
  autoplay = true,
  isOnboarding,
  disableCache,
  onError,
  onEvent,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isReady, setIsReady] = useState(false);
  const webViewReadyReceived = useRef(false);
  const initializationSent = useRef(false);

  // Initialize token and clear cache if token changed for modal component
  useEffect(() => {
    const initializeToken = async () => {
      try {
        // Set debug mode in CacheManager
        CacheManager.setDebugMode(isDebugMode || false);

        // Reset initialization state when token changes
        initializationSent.current = false;
        webViewReadyReceived.current = false;
        setIsReady(false);

        const cacheCleared = await CacheManager.initializeWithToken('modal', token);
        if (cacheCleared && isDebugMode) {
          console.log('StoryModal: Cache cleared due to token change');
        }

        // Force WebView reload when token changes to clear all WebView caches
        if (cacheCleared && webViewRef.current) {
          if (isDebugMode) {
            console.log('StoryModal: Forcing WebView reload due to token change');
          }
          webViewRef.current.reload();
        }
      } catch (error) {
        if (isDebugMode) {
          console.warn('StoryModal: Error initializing token:', error);
        }
      }
    };

    initializeToken();
  }, [token, isDebugMode]);

  useEffect(() => {
    return () => {
      StorageHandler.flushWrites().catch(() => { });
    };
  }, []);

  useEffect(() => {
    if (groupId) {
      // Reset state when groupId changes
      initializationSent.current = false;
      webViewReadyReceived.current = false;
      setIsReady(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (isDebugMode) {
      console.log('StoryModal useEffect triggered, isReady:', isReady, 'webViewRef:', !!webViewRef.current, 'initializationSent:', initializationSent.current, 'groupId:', groupId);
    }

    if (webViewRef.current && groupId && isReady && !initializationSent.current) {
      initializationSent.current = true;

      if (isDebugMode) {
        console.log('StoryModal: Sending init message to WebView');
      }

      const options = {
        token,
        groupId,
        isShowMockup,
        isStatusBarActive,
        autoplay,
        arrowsColor,
        backgroundColor,
        isDebugMode,
        devMode,
        forbidClose,
        isInReactNativeWebView: true,
        platform: Platform.OS,
        isOnboarding,
        disableCache
      };

      const message = {
        type: 'init',
        data: options,
      };

      if (Platform.OS === 'android') {
        if (webViewRef.current) {
          webViewRef.current?.injectJavaScript(`
              (function() {
                const message = ${JSON.stringify(message)};
                if (window.STORYSDK_DEBUG) {
                  console.log('Android: Dispatching init message:', message);
                }
                window.dispatchEvent(new MessageEvent('message', {
                  data: message
                }));
                true;
              })();
            `);
        }
      } else {
        webViewRef.current.postMessage(JSON.stringify(message));
      }

      if (isDebugMode) {
        console.log('StoryModal: Init message sent, message:', message);
      }
    } else if (isDebugMode && initializationSent.current) {
      console.log('StoryModal: Skipping init - already sent');
    }
  }, [token, groupId, isReady]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (onEvent) {
        onEvent(data.type, data.data);
      }

      // Add detailed debug logging for storysdk:debug:info
      if (data.type === 'storysdk:debug:info' && isDebugMode) {
        console.log('StorySDK Debug:', data.data?.message || data.data);
      }

      // Processing storage messages
      if (data.type === 'storysdk:storage:get' || data.type === 'storysdk:storage:set') {
        StorageHandler.handleMessage(data, (response) => {
          if (webViewRef.current) {
            webViewRef.current.injectJavaScript(`
              (function() {
                window.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(response)} }));
                true;
              })();
            `);
          }
        });
        return;
      }

      if (data.type === 'webview:ready') {
        if (isDebugMode) {
          console.log('StoryModal: Received webview:ready event', {
            currentIsReady: isReady,
            alreadyReceived: webViewReadyReceived.current,
            timestamp: new Date().toISOString(),
            eventData: data
          });
        }

        // Prevent duplicate processing of webview:ready events
        if (!webViewReadyReceived.current) {
          webViewReadyReceived.current = true;
          if (isDebugMode) {
            console.log('StoryModal: Processing webview:ready - setting isReady to true');
          }
          setIsReady(true);
        } else {
          if (isDebugMode) {
            console.log('StoryModal: Ignoring duplicate webview:ready event');
          }
        }
      } else if ((data.type === 'storyModalClose' || data.data?.actionType === 'close') && onClose) {
        onClose();
      } else if (data.type === 'storysdk:data:loaded') {
        if (isDebugMode) {
          console.log('StoryModal: Data loaded successfully', data.data);
        }
      } else if (data.type === 'init:success') {
        if (isDebugMode) {
          console.log('StoryModal: SDK initialized successfully', data.data);
        }
      } else if (data.type === 'error') {
        if (isDebugMode) {
          console.log('StoryModal: Received error from SDK:', data);
        }

        if (data.message === 'SDK initialization timeout' && isOnboarding && onClose) {
          if (isDebugMode) {
            console.log('StoryModal: SDK initialization timeout for onboarding, auto-closing');
          }
          onClose();
          return;
        }

        if (onError) {
          onError(data);
        }
      }
    } catch (error) {
      if (onError) {
        try {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const errorDetails = error instanceof Error && error.stack ? error.stack : undefined;

          onError({
            message: `Error parsing message: ${errorMessage}`,
            details: errorDetails
          });
        } catch {
          onError({ message: 'Error parsing message' });
        }
      }
    }
  };

  const handleWebViewError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;

    if (onError) {
      onError({ message: 'WebView error', details: nativeEvent.description });
    }
  }, [onError]);

  if (!groupId) {
    return null;
  }

  return (
    <Modal
      visible={!!groupId}
      transparent={true}
      animationType="fade"
      onRequestClose={() => { }}
      style={{ backgroundColor: backgroundColor }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.webviewContainer}>
          <WebView
            ref={webViewRef}
            source={{ html: sdkHtml }}
            onMessage={handleMessage}
            onError={handleWebViewError}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;

              if (onError) {
                onError({ message: 'WebView HTTP error', details: JSON.stringify(nativeEvent) });
              }
            }}
            onRenderProcessGone={syntheticEvent => {
              if (isDebugMode) {
                console.log('StoryModal: WebView render process gone, reloading...');
              }
              webViewReadyReceived.current = false;
              initializationSent.current = false;
              setIsReady(false);
              webViewRef.current?.reload();
            }}
            style={styles.webview}
            allowsInlineMediaPlayback={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
            cacheEnabled={!disableCache}
            mixedContentMode="compatibility"
            allowsFullscreenVideo={false}
            allowsBackForwardNavigationGestures={false}
            bounces={false}
            onContentProcessDidTerminate={() => {
              if (isDebugMode) {
                console.log('StoryModal: WebView content process terminated, reloading...');
              }
              webViewReadyReceived.current = false;
              initializationSent.current = false;
              setIsReady(false);
              webViewRef.current?.reload();
            }}
            mediaPlaybackRequiresUserAction={false}
            nestedScrollEnabled={true}
            overScrollMode="never"
            thirdPartyCookiesEnabled={true}
            javaScriptCanOpenWindowsAutomatically={true}
            setSupportMultipleWindows={false}
            allowFileAccess={true}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webviewContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  webview: {
    flex: 1,
  }
}); 