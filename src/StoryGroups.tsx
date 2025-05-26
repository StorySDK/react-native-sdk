import React, { useEffect, useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, View, Platform } from 'react-native';
import sdkHtml from './sdk.html';
import { StorageHandler } from './StorageHandler';
import { TokenManager } from './TokenManager';

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
  onError,
  onEvent,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isReady, setIsReady] = useState(false);
  const [containerHeight, setContainerHeight] = useState(() => {
    // Calculate initial height based on group parameters
    const calculatedMinHeight = groupImageHeight + groupTitleSize + DEFAULT_GROUP_TITLE_PADDING * 2;
    return calculatedMinHeight < DEFAULT_GROUP_MIN_HEIGHT ? DEFAULT_GROUP_MIN_HEIGHT : calculatedMinHeight;
  });

  // Initialize token and clear cache if token changed
  useEffect(() => {
    const initializeToken = async () => {
      try {
        const cacheCleared = await TokenManager.initializeWithToken(token);
        if (cacheCleared && isDebugMode) {
          console.log('StoryGroups: Cache cleared due to token change');
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
    if (webViewRef.current && isReady) {
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
        devMode
      };

      const message = {
        type: 'init',
        data: options,
      };

      if (Platform.OS === 'android') {
        setTimeout(() => {
          webViewRef.current?.injectJavaScript(`
            (function() {
              const message = ${JSON.stringify(message)};
              window.dispatchEvent(new MessageEvent('message', {
                data: JSON.stringify(message)
              }));
              true;
            })();
          `);
        }, 500);
      } else {
        webViewRef.current.postMessage(JSON.stringify(message));
      }
    }
  }, [token, groupImageWidth, groupImageHeight, groupTitleSize, groupClassName, groupsClassName, activeGroupOutlineColor, groupsOutlineColor, arrowsColor, backgroundColor, isDebugMode, devMode, isReady]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (isDebugMode) {
        console.log('StoryGroups handleMessage', data);
      }

      if (onEvent) {
        onEvent(data.type, data.data);
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
        setIsReady(true);
      } else if (data.type === 'content:height') {
        // Handle content height from WebView - compare with calculated height and use maximum
        const actualHeight = data.data?.height || DEFAULT_GROUP_MIN_HEIGHT;

        // Use maximum of theoretical and actual heights
        const finalHeight = Math.max(containerHeight, actualHeight);
        setContainerHeight(finalHeight);
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

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;

    if (onError) {
      onError({ message: 'WebView error', details: nativeEvent.description });
    }
  };

  const handleContainerLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    const calculatedMinHeight = groupImageHeight + groupTitleSize + DEFAULT_GROUP_TITLE_PADDING * 2;
    const minAllowedHeight = calculatedMinHeight < DEFAULT_GROUP_MIN_HEIGHT ? DEFAULT_GROUP_MIN_HEIGHT : calculatedMinHeight;
    const finalHeight = height < minAllowedHeight ? minAllowedHeight : height;
    setContainerHeight(finalHeight);
  };

  return (
    <View
      style={[styles.container, backgroundColor ? { backgroundColor } : null]}
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
          webViewRef.current?.reload();
        }}
        style={[styles.webview, { height: containerHeight }]}
        allowsInlineMediaPlayback={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        androidLayerType="hardware"
        cacheEnabled={true}
        onContentProcessDidTerminate={() => {
          webViewRef.current?.reload();
        }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
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
    flex: 1,
  },
  webview: {
    backgroundColor: 'transparent',
    flex: 1,
  },
}); 