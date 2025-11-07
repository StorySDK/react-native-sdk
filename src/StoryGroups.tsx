import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, View, Platform } from 'react-native';
import sdkHtml from './sdk.html';
import { StorageHandler } from './StorageHandler';
import { CacheManager } from './CacheManager';

// Import Story SDK Core for web platform
let StorySDKCore: any = null;
let StorySDKCoreCSS: string = '';

// Try to import Story SDK Core for web platform
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  try {
    const storySDKCore = require('@storysdk/core');
    StorySDKCore = storySDKCore.Story;

    try {
      StorySDKCoreCSS = require('@storysdk/core/dist/bundle.css');
    } catch (cssError) {
      console.warn('StoryGroups: Failed to load CSS, continuing without it:', cssError);
      StorySDKCoreCSS = '';
    }
  } catch (error: any) {
    console.error('StoryGroups: Failed to load @storysdk/core for web platform:', error);
    StorySDKCore = null;
    StorySDKCoreCSS = '';
  }
}

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
  useAsyncStorageOnly?: boolean;
  onError?: (error: { message: string, details?: string }) => void;
  onEvent?: (event: string, data: any) => void;
}

/**
 * Component for displaying a list of story groups
 * Uses WebView for mobile platforms and Story SDK Core for web platform
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
  useAsyncStorageOnly,
  onError,
  onEvent,
}) => {
  const webViewRef = useRef<WebView>(null);
  const webContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const storySDKInstanceRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const webViewReadyReceived = useRef(false);
  const initializationSent = useRef(false);
  const currentTokenRef = useRef(token);
  const [containerHeight, setContainerHeight] = useState(() => {
    // Calculate initial height based on group parameters
    const calculatedMinHeight = groupImageHeight + groupTitleSize + DEFAULT_GROUP_TITLE_PADDING * 2;
    return calculatedMinHeight < DEFAULT_GROUP_MIN_HEIGHT ? DEFAULT_GROUP_MIN_HEIGHT : calculatedMinHeight;
  });

  // Helper function to determine rendering method
  const renderingMethod = useMemo(() => {
    if (Platform.OS === 'web') {
      if (StorySDKCore) {
        return 'web-sdk-core';
      } else {
        return 'web-iframe';
      }
    } else {
      return 'mobile-webview';
    }
  }, [Platform.OS, StorySDKCore]);

  // Web-specific initialization
  useEffect(() => {
    if (renderingMethod === 'web-sdk-core' && webContainerRef.current) {
      const initializeWebSDK = async () => {
        try {
          // Additional environment verification
          if (typeof window === 'undefined' || typeof document === 'undefined') {
            throw new Error('Web environment is not properly available');
          }

          // Inject CSS for web platform
          if (StorySDKCoreCSS && !document.querySelector('[data-storysdk-styles]')) {
            const style = document.createElement('style');
            style.setAttribute('data-storysdk-styles', 'true');
            style.textContent = StorySDKCoreCSS;
            document.head.appendChild(style);
          }

          // Clean up previous instance
          if (storySDKInstanceRef.current) {
            try {
              storySDKInstanceRef.current.destroy();
            } catch (destroyError) {
              console.warn('StoryGroups: Error destroying previous instance:', destroyError);
            }
            storySDKInstanceRef.current = null;
          }

          // Create new Story SDK instance for web
          const options = {
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
            disableCache,
            preventCloseOnGroupClick: Platform.OS === 'web' ? false : true,
            isOnlyGroups: Platform.OS === 'web' ? false : true,
          };

          if (isDebugMode) {
            console.log('StoryGroups: Creating Story SDK instance with options:', options);
          }

          const storySDK = new StorySDKCore(token, options);
          storySDKInstanceRef.current = storySDK;

          // Set up event listeners for web
          if (onGroupClick) {
            storySDK.on('groupClick', (data: any) => {
              if (onGroupClick && data?.groupId) {
                onGroupClick(data.groupId);
              }
            });
          }

          if (onEvent) {
            const events = [
              'groupClose', 'groupOpen', 'storyClose', 'storyOpen',
              'storyNext', 'storyPrev', 'widgetAnswer', 'widgetClick',
              'storyModalOpen', 'storyModalClose', 'dataLoaded'
            ];

            events.forEach(eventName => {
              storySDK.on(eventName, (data: any) => {
                onEvent(eventName, data);
              });
            });
          }

          if (onError) {
            storySDK.on('error', (error: any) => {
              onError({
                message: error.message || 'Story SDK Error',
                details: error.details || error.stack
              });
            });
          }

          // Render groups
          if (webContainerRef.current) {
            if (isDebugMode) {
              console.log('StoryGroups: Rendering groups to container:', webContainerRef.current);
            }
            storySDK.renderGroups(webContainerRef.current);
          } else {
            throw new Error('Web container ref is null during rendering');
          }

          if (isDebugMode) {
            console.log('StoryGroups: Web SDK initialized successfully');
          }

        } catch (error) {
          if (isDebugMode) {
            console.error('StoryGroups: Error initializing web SDK:', error);
            console.error('StoryGroups: StorySDKCore available:', !!StorySDKCore);
            console.error('StoryGroups: Container available:', !!webContainerRef.current);
          }

          // Reset StorySDKCore to force fallback to WebView
          StorySDKCore = null;

          if (onError) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            onError({
              message: `Web SDK initialization failed: ${errorMessage}`,
              details: error instanceof Error ? error.stack : undefined
            });
          }
        }
      };

      initializeWebSDK();

      // Cleanup function
      return () => {
        if (storySDKInstanceRef.current) {
          try {
            if (isDebugMode) {
              console.log('StoryGroups: Cleaning up Story SDK instance');
            }
            storySDKInstanceRef.current.destroy();
          } catch (cleanupError) {
            console.warn('StoryGroups: Error during cleanup:', cleanupError);
          }
          storySDKInstanceRef.current = null;
        }
      };
    }
  }, [token, Platform.OS, groupImageWidth, groupImageHeight, groupTitleSize, groupClassName, groupsClassName, activeGroupOutlineColor, groupsOutlineColor, arrowsColor, backgroundColor, isDebugMode, devMode, disableCache, onGroupClick, onEvent, onError]);

  // Iframe-specific initialization for web fallback
  useEffect(() => {
    if (renderingMethod === 'web-iframe') {
      // Set up message listener for iframe communication
      const handleIframeMessage = (event: MessageEvent) => {
        try {
          if (isDebugMode) {
            console.log('StoryGroups: Received iframe message:', event.data);
          }

          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

          if (onEvent) {
            onEvent(data.type, data.data);
          }

          // Handle group click events
          if (data.type === 'groupClick' && onGroupClick) {
            onGroupClick(data.data.groupId);
          }
        } catch (error) {
          if (isDebugMode) {
            console.warn('StoryGroups: Error handling iframe message:', error);
          }
        }
      };

      window.addEventListener('message', handleIframeMessage);

      // Send initialization message to iframe once it's loaded
      const sendInitMessage = () => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
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
            isOnlyGroups: true,
            platform: 'web',
            disableCache,
          };

          const message = {
            type: 'init',
            data: options,
          };

          iframeRef.current.contentWindow.postMessage(JSON.stringify(message), '*');

          if (isDebugMode) {
            console.log('StoryGroups: Sent init message to iframe:', message);
          }
        }
      };

      // Delay to ensure iframe is ready
      const timer = setTimeout(sendInitMessage, 1000);

      return () => {
        window.removeEventListener('message', handleIframeMessage);
        clearTimeout(timer);
      };
    }
  }, [renderingMethod, token, groupImageWidth, groupImageHeight, groupTitleSize, groupClassName, groupsClassName, activeGroupOutlineColor, groupsOutlineColor, arrowsColor, backgroundColor, isDebugMode, devMode, disableCache, onGroupClick, onEvent]);

  // Mobile-specific initialization (existing logic)
  useEffect(() => {
    if (renderingMethod === 'mobile-webview') {
      const initializeToken = async () => {
        try {
          // Set debug mode in CacheManager
          CacheManager.setDebugMode(isDebugMode || false);

          // Update current token ref to prevent stale closures
          currentTokenRef.current = token;

          // Reset initialization state when token changes
          initializationSent.current = false;
          webViewReadyReceived.current = false;
          setIsReady(false);

          const cacheCleared = await CacheManager.initializeWithToken('groups', token);
          if (isDebugMode) {
            console.log('StoryGroups: Token initialization result:', { token, cacheCleared });
          }
          if (cacheCleared && isDebugMode) {
            console.log('StoryGroups: Cache cleared due to token change');
          }

          // Force WebView reload when token changes to clear all WebView caches
          if (cacheCleared && webViewRef.current) {
            if (isDebugMode) {
              console.log('StoryGroups: Forcing WebView reload due to token change');
            }

            // Clear WebView cache including script cache
            webViewRef.current.injectJavaScript(`
              (function() {
                try {
                  // Clear all caches
                  if (typeof caches !== 'undefined') {
                    caches.keys().then(function(names) {
                      for (let name of names) {
                        caches.delete(name);
                      }
                    });
                  }
                  
                  // Clear localStorage and sessionStorage
                  if (typeof localStorage !== 'undefined') {
                    localStorage.clear();
                  }
                  if (typeof sessionStorage !== 'undefined') {
                    sessionStorage.clear();
                  }
                  
                  // Clear any cached SDK scripts
                  const scripts = document.querySelectorAll('script[src*="storysdk"]');
                  scripts.forEach(script => script.remove());
                  
                  console.log('StorySDK: Cleared all WebView caches');
                } catch (e) {
                  console.warn('StorySDK: Error clearing caches:', e);
                }
              })();
            `);

            // Small delay then reload
            setTimeout(() => {
              if (webViewRef.current) {
                webViewRef.current.reload();
              }
            }, 100);
          }

          // Also send cache clear message to WebView if needed
          if (webViewRef.current && (cacheCleared || disableCache)) {
            const clearCacheMessage = {
              type: 'storysdk:cache:clear:all',
              data: {}
            };

            if (Platform.OS === 'android') {
              webViewRef.current.injectJavaScript(`
                (function() {
                  const message = ${JSON.stringify(clearCacheMessage)};
                  window.dispatchEvent(new MessageEvent('message', {
                    data: JSON.stringify(message)
                  }));
                  true;
                })();
              `);
            } else {
              webViewRef.current.postMessage(JSON.stringify(clearCacheMessage));
            }

            if (isDebugMode) {
              console.log('StoryGroups: Sent cache clear message to WebView');
            }
          }
        } catch (error) {
          if (isDebugMode) {
            console.warn('StoryGroups: Error initializing token:', error);
          }
        }
      };

      initializeToken();
    }
  }, [token, isDebugMode, disableCache]);

  useEffect(() => {
    if (renderingMethod === 'mobile-webview') {
      return () => {
        StorageHandler.flushWrites().catch(() => { });
      };
    }
  }, [renderingMethod]);

  useEffect(() => {
    if (renderingMethod === 'mobile-webview') {
      if (isDebugMode) {
        console.log('StoryGroups useEffect triggered, isReady:', isReady, 'webViewRef:', !!webViewRef.current, 'initializationSent:', initializationSent.current);
      }

      if (webViewRef.current && isReady && !initializationSent.current) {
        initializationSent.current = true;

        if (isDebugMode) {
          console.log('StoryGroups: Sending init message to WebView');
        }

        // Use current token from ref to prevent stale closures
        const currentToken = currentTokenRef.current;

        if (isDebugMode) {
          console.log('StoryGroups: Using token from ref:', currentToken, 'vs prop token:', token);
        }

        const options = {
          token: currentToken,
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
          disableCache,
          useAsyncStorageOnly
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
                    data: JSON.stringify(message)
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

  // Web platform render
  if (Platform.OS === 'web') {
    if (renderingMethod === 'web-iframe') {
      // Iframe fallback for web platform when StorySDK Core is not available
      if (isDebugMode) {
        console.log('StoryGroups: Using iframe fallback on web platform');
      }

      const iframeUrl = `data:text/html;charset=utf-8,${encodeURIComponent(sdkHtml)}`;

      return (
        <View
          style={containerStyle}
          onLayout={handleContainerLayout}
        >
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            style={{
              width: '100%',
              minHeight: containerHeight,
              border: 'none',
              backgroundColor: backgroundColor || 'transparent'
            }}
            onLoad={() => {
              if (isDebugMode) {
                console.log('StoryGroups: Iframe loaded successfully');
              }
            }}
            onError={(error) => {
              if (isDebugMode) {
                console.error('StoryGroups: Iframe load error:', error);
              }
              if (onError) {
                onError({
                  message: 'Iframe load error',
                  details: error.toString()
                });
              }
            }}
          />
        </View>
      );
    }

    // StorySDK Core direct rendering
    return (
      <View
        style={containerStyle}
        onLayout={handleContainerLayout}
      >
        <div
          ref={webContainerRef}
          style={{
            width: '100%',
            minHeight: containerHeight,
            backgroundColor: backgroundColor || 'transparent'
          }}
        />
      </View>
    );
  }

  // Mobile platform render (existing WebView logic)
  return (
    <View
      style={containerStyle}
      onLayout={handleContainerLayout}
    >
      <WebView
        ref={webViewRef}
        source={{
          html: sdkHtml,
          // Add unique key based on token to prevent caching with old token
          baseUrl: `storysdk://token-${encodeURIComponent(token).substring(0, 8)}`
        }}
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
        // Force reload mode when cache is disabled or token changes
        cacheMode={disableCache ? 'LOAD_NO_CACHE' : 'LOAD_DEFAULT'}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
}); 