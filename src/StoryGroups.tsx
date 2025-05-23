import React, { useEffect, useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, View, Platform, Animated } from 'react-native';
import sdkHtml from './sdk.html';
import { StorageHandler } from './StorageHandler';
import { SkeletonLoader } from './SkeletonLoader';

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
  groupImageHeight,
  groupTitleSize,
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
  const [isLoading, setIsLoading] = useState(true);
  const webViewOpacity = useRef(new Animated.Value(0)).current;
  const skeletonOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    return () => {
      StorageHandler.flushWrites().catch(() => { });
    };
  }, []);

  useEffect(() => {
    if (isLoading) {
      Animated.parallel([
        Animated.timing(skeletonOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(webViewOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(skeletonOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(webViewOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isLoading, skeletonOpacity, webViewOpacity]);

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
      } else if (data.type === 'init:success') {
        setIsLoading(false);
      } else if (data.type === 'error') {
        setIsLoading(false);
        if (onError) {
          onError(data);
        }
      }
    } catch (error) {
      setIsLoading(false);
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

  return (
    <View style={[styles.container, backgroundColor ? { backgroundColor } : null]}>
      <Animated.View style={[styles.skeletonContainer, { opacity: skeletonOpacity }]}>
        <SkeletonLoader
          groupImageWidth={groupImageWidth}
          groupImageHeight={groupImageHeight}
          backgroundColor={backgroundColor}
        />
      </Animated.View>
      <Animated.View style={[styles.webviewContainer, { opacity: webViewOpacity }]}>
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
          style={styles.webview}
          allowsInlineMediaPlayback={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
          androidLayerType="hardware"
          cacheEnabled={true}
          onContentProcessDidTerminate={() => {
            webViewRef.current?.reload();
          }}
          nestedScrollEnabled={true}
          overScrollMode="never"
          thirdPartyCookiesEnabled={true}
          javaScriptCanOpenWindowsAutomatically={true}
          setSupportMultipleWindows={false}
          allowFileAccess={true}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 120,
    position: 'relative'
  },
  skeletonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
    overflowY: 'hidden',
    backgroundColor: 'transparent'
  },
}); 