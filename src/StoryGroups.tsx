import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, View, Platform } from 'react-native';
import sdkHtml from './sdk.html';
import { StorageHandler } from './StorageHandler';
import { CacheManager } from './CacheManager';

// Constants matching web-sdk GroupsList
const DEFAULT_GROUP_IMAGE_HEIGHT = 68;
const DEFAULT_GROUP_TITLE_SIZE = 16;
const DEFAULT_GROUP_MIN_HEIGHT = 110;
const DEFAULT_GROUP_TITLE_PADDING = 4;

interface StoryGroupsProps {
  token: string;
  onGroupClick?: (groupId: string) => void;
  groupImageWidth?: number;
  groupImageHeight?: number;
  groupTitleSize?: number;
  groupClassName?: string;
  groupsClassName?: string;
  activeGroupOutlineColor?: string;
  groupsOutlineColor?: string;
  arrowsColor?: string;
  backgroundColor?: string;
  isDebugMode?: boolean;
  disableCache?: boolean;
  devMode?: 'staging' | 'development';
  onError?: (error: { message: string, details?: string }) => void;
  onEvent?: (event: string, data: any) => void;
}

/**
 * Component for displaying a list of story groups
 * Uses WebView to render the groups and handles group click events
 */
export const StoryGroups: React.FC<StoryGroupsProps> = ({
  token,
  onGroupClick,
  groupImageWidth,
  groupImageHeight = DEFAULT_GROUP_IMAGE_HEIGHT,
  groupTitleSize = DEFAULT_GROUP_TITLE_SIZE,
  groupClassName,
  groupsClassName,
  activeGroupOutlineColor,
  groupsOutlineColor,
  arrowsColor,
  backgroundColor,
  isDebugMode,
  devMode,
  disableCache,
  onError,
  onEvent,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isReady, setIsReady] = useState(false);
  const webViewReadyReceived = useRef(false);
  const initializationSent = useRef(false);
  const [containerHeight, setContainerHeight] = useState(() => {
    // Calculate initial height based on group parameters
    const calculatedMinHeight = groupImageHeight + groupTitleSize + DEFAULT_GROUP_TITLE_PADDING * 2;
    return calculatedMinHeight < DEFAULT_GROUP_MIN_HEIGHT ? DEFAULT_GROUP_MIN_HEIGHT : calculatedMinHeight;
  });

  // Initialize token and clear cache if token changed for groups component
  useEffect(() => {
    const initializeToken = async () => {
      try {
        // Set debug mode in CacheManager
        CacheManager.setDebugMode(isDebugMode || false);

        // Reset initialization state when token changes
        initializationSent.current = false;
        webViewReadyReceived.current = false;
        setIsReady(false);

        const cacheCleared = await CacheManager.initializeWithToken('groups', token);
        if (cacheCleared && isDebugMode) {
          console.log('StoryGroups: Cache cleared due to token change');
        }

        // Force WebView reload when token changes to clear all WebView caches
        if (cacheCleared && webViewRef.current) {
          if (isDebugMode) {
            console.log('StoryGroups: Forcing WebView reload due to token change');
          }
          webViewRef.current.reload();
        }
      } catch (error) {
        if (isDebugMode) {
          console.warn('StoryGroups: Error initializing token:', error);
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
    if (isDebugMode) {
      console.log('StoryGroups useEffect triggered, isReady:', isReady, 'webViewRef:', !!webViewRef.current, 'initializationSent:', initializationSent.current);
    }

    if (webViewRef.current && isReady && !initializationSent.current) {
      initializationSent.current = true;

      if (isDebugMode) {
        console.log('StoryGroups: Sending init message to WebView');
      }

      const options = {
        token,
        groupImageWidth,
        groupImageHeight,
        groupTitleSize,
        groupClassName,
        groupsClassName,
        activeGroupOutlineColor,
        groupsOutlineColor,
        arrowsColor,
        backgroundColor,
        isDebugMode,
        preventCloseOnGroupClick: true,
        isInReactNativeWebView: true,
        isOnlyGroups: true,
        platform: Platform.OS,
        devMode,
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
        console.log('StoryGroups: Init message sent, message:', message);
      }
    } else if (isDebugMode && initializationSent.current) {
      console.log('StoryGroups: Skipping init - already sent');
    }
  }, [token, isReady]);

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

      // Processing story group click
      if (data.type === 'groupClick' && onGroupClick) {
        onGroupClick(data.data.groupId);
      } else if (data.type === 'webview:ready') {
        if (isDebugMode) {
          console.log('StoryGroups: Received webview:ready event', {
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
            console.log('StoryGroups: Processing webview:ready - setting isReady to true');
          }
          setIsReady(true);
        } else {
          if (isDebugMode) {
            console.log('StoryGroups: Ignoring duplicate webview:ready event');
          }
        }
      } else if (data.type === 'content:height') {
        // Handle content height from WebView - compare with calculated height and use maximum
        const actualHeight = data.data?.height || DEFAULT_GROUP_MIN_HEIGHT;

        // Use maximum of theoretical and actual heights
        const finalHeight = Math.max(containerHeight, actualHeight);

        // Only update height if it actually changed to prevent unnecessary re-renders
        if (finalHeight !== containerHeight) {
          if (isDebugMode) {
            console.log('StoryGroups: Updating height from WebView content', {
              actualHeight,
              containerHeight,
              finalHeight,
              platform: Platform.OS
            });
          }
          setContainerHeight(finalHeight);
        } else if (isDebugMode) {
          console.log('StoryGroups: Height unchanged, skipping update', {
            actualHeight,
            containerHeight,
            finalHeight,
            platform: Platform.OS
          });
        }
      } else if (data.type === 'storysdk:data:loaded') {
        if (isDebugMode) {
          console.log('StoryGroups: Data loaded successfully', data.data);
        }
      } else if (data.type === 'init:success') {
        if (isDebugMode) {
          console.log('StoryGroups: SDK initialized successfully', data.data);
        }
      } else if (data.type === 'storysdk:groups:empty') {
        if (isDebugMode) {
          console.log('StoryGroups: No groups available or all groups filtered out', data.data);
        }
        if (onError) {
          onError({
            message: 'No story groups available',
            details: 'All groups were filtered out or no groups exist for this token'
          });
        }
      } else if (data.type === 'error') {
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

  const handleContainerLayout = useCallback((event: any) => {
    const { height } = event.nativeEvent.layout;
    const calculatedMinHeight = groupImageHeight + groupTitleSize + DEFAULT_GROUP_TITLE_PADDING * 2;
    const minAllowedHeight = calculatedMinHeight < DEFAULT_GROUP_MIN_HEIGHT ? DEFAULT_GROUP_MIN_HEIGHT : calculatedMinHeight;
    const finalHeight = height < minAllowedHeight ? minAllowedHeight : height;

    // Only update height if it actually changed to prevent unnecessary re-renders
    if (finalHeight !== containerHeight) {
      if (isDebugMode) {
        console.log('StoryGroups: Container layout changed, updating height', {
          oldHeight: containerHeight,
          newHeight: finalHeight,
          layoutHeight: height,
          minAllowedHeight,
          platform: Platform.OS
        });
      }
      setContainerHeight(finalHeight);
    }
  }, [containerHeight, groupImageHeight, groupTitleSize, isDebugMode]);

  // Memoize container styles
  const containerStyle = useMemo(() => [
    styles.container,
    backgroundColor ? { backgroundColor } : null,
    {
      minHeight: containerHeight
    }
  ], [backgroundColor, containerHeight]);

  return (
    <View
      style={containerStyle}
      onLayout={handleContainerLayout}
    >
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
            console.log('StoryGroups: WebView render process gone, reloading...');
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
            console.log('StoryGroups: WebView content process terminated, reloading...');
          }
          webViewReadyReceived.current = false;
          initializationSent.current = false;
          setIsReady(false);
          webViewRef.current?.reload();
        }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
        nestedScrollEnabled={false}
        thirdPartyCookiesEnabled={true}
        javaScriptCanOpenWindowsAutomatically={true}
        setSupportMultipleWindows={false}
        allowFileAccess={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: DEFAULT_GROUP_MIN_HEIGHT,
    backgroundColor: 'transparent',
  },
  webview: {
    backgroundColor: 'transparent',
    opacity: 1,
    height: '100%',
    width: '100%',
  },
}); 