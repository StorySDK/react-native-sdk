import React, { useEffect, useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, View, Modal, Platform } from 'react-native';
import sdkHtml from './sdk.html';
import { StorageHandler } from './StorageHandler';
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
  autoplay = true,
  isOnboarding,
  onError,
  onEvent,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // When component unmounts, flush all pending writes to storage
    return () => {
      StorageHandler.flushWrites().catch(() => { });
    };
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      setIsReady(false);
      setIsLoading(true);
    }
  }, [groupId]);

  useEffect(() => {
    if (webViewRef.current && groupId && isReady) {
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
        isInReactNativeWebView: true,
        platform: Platform.OS,
        isOnboarding,
      };

      const message = {
        type: 'init',
        data: options,
      };

      if (Platform.OS === 'android') {
        setTimeout(() => {
          const jsCode = `
            (function() {
              try {
                const message = {
                  type: '${message.type}',
                  data: ${JSON.stringify(options)}
                };
                window.dispatchEvent(new MessageEvent('message', {
                  data: JSON.stringify(message)
                }));
                true;
              } catch(e) {
                true;
              }
            })();
          `;
          webViewRef.current?.injectJavaScript(jsCode);
        }, 500);
      } else {
        webViewRef.current.postMessage(JSON.stringify(message));
      }
    }
  }, [token, groupId, isShowMockup, isStatusBarActive, arrowsColor, backgroundColor, isDebugMode, devMode, isReady, autoplay]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)

      if (isDebugMode) {
        console.log('StoryModal handleMessage', data);
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

      // Processing events
      if (onEvent) {
        onEvent(data.type, data.data);
      }

      if (data.type === 'webview:ready') {
        setIsReady(true);
      } else if ((data.type === 'storyModalClose' || data.data?.actionType === 'close') && onClose) {
        onClose();
      } else if (data.type === 'error') {
        setIsLoading(false);
        if (onError) {
          onError(data);
        }
      } else if (data.type === 'init:success') {
        setIsLoading(false);
      }
    } catch (error) {
      if (onError) {
        onError({ message: 'Error parsing message' });
      }
    }
  };

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    setIsLoading(false);

    if (onError) {
      onError({ message: 'WebView error', details: nativeEvent.description || JSON.stringify(nativeEvent) });
    }
  };

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
            onRenderProcessGone={() => {
              webViewRef.current?.reload();
            }}
            style={[styles.webview]}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            originWhitelist={['*']}
            mixedContentMode="compatibility"
            androidLayerType={Platform.OS === 'android' ? 'hardware' : undefined}
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