import React, { useEffect, useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, View, Platform } from 'react-native';
import sdkHtml from './sdk.html';
import { StorageHandler } from './StorageHandler';

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
        platform: Platform.OS,
        devMode
      };

      const message = {
        type: 'init',
        options: JSON.stringify(options),
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
      } else if (data.type === 'error') {
        if (onError) {
          onError(data);
        }
      }
    } catch (error) {
      if (onError) {
        onError({ message: 'Error parsing message' });
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
        onLoadProgress={({ nativeEvent }) => {
          if (Platform.OS === 'android' && nativeEvent.progress > 0.5) {
            setIsLoading(false);
          }
        }}
        onLoad={() => {
          setIsLoading(false);
        }}
        onLoadEnd={() => {
          setIsLoading(false);
        }}
        style={[styles.webview, isLoading && { opacity: 0 }]}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 120
  },
  webview: {
    flex: 1,
    overflowY: 'hidden',
    ...Platform.select({
      android: {
        backgroundColor: 'transparent',
      }
    })
  },
}); 