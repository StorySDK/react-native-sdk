import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import sdkHtml from './sdk.html';

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
      console.warn('StoryModalWeb: Failed to load CSS, continuing without it:', cssError);
      StorySDKCoreCSS = '';
    }
  } catch (error: any) {
    console.error('StoryModalWeb: Failed to load @storysdk/core for web platform:', error);
    StorySDKCore = null;
    StorySDKCoreCSS = '';
  }
}

interface StoryModalWebProps {
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
  disableCache?: boolean;
  onClose?: () => void;
  onError?: (error: { message: string, details?: string }) => void;
  onEvent?: (event: string, data: any) => void;
}

/**
 * Component for displaying stories in a modal window for web platform only
 * Uses Story SDK Core or iframe fallback
 */
export const StoryModalWeb: React.FC<StoryModalWebProps> = ({
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
  disableCache,
  onError,
  onEvent,
}) => {

  if (Platform.OS !== 'web') {
    console.warn('StoryModalWeb is not supported on non-web platform. Please use StoryModal instead.');
    return null;
  }

  const webContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const storySDKInstanceRef = useRef<any>(null);
  const [webSDKFailed, setWebSDKFailed] = useState(false);

  // Stable callbacks to prevent useEffect re-runs
  const stableOnClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const stableOnEvent = useCallback((event: string, data: any) => {
    onEvent?.(event, data);
  }, [onEvent]);

  const stableOnError = useCallback((error: { message: string, details?: string }) => {
    onError?.(error);
  }, [onError]);

  const initializeWebSDK = useCallback(() => {
    try {
      // Additional environment verification
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        throw new Error('Web environment is not properly available');
      }

      const isModalExist = document.querySelector('#storysdk-modal-root');

      if (isModalExist) {
        return;
      }

      // Inject CSS for web platform (only once)
      if (StorySDKCoreCSS && !document.querySelector('[data-storysdk-modal-styles]')) {
        const style = document.createElement('style');
        style.setAttribute('data-storysdk-modal-styles', 'true');
        style.textContent = StorySDKCoreCSS;
        document.head.appendChild(style);
      }

      // Clean up previous instance
      if (storySDKInstanceRef.current) {
        try {
          storySDKInstanceRef.current.destroy();
        } catch (destroyError) {
          console.warn('StoryModalWeb: Error destroying previous instance:', destroyError);
        }
        storySDKInstanceRef.current = null;
      }

      // Create new Story SDK instance for web
      const options = {
        groupId,
        isShowMockup,
        isStatusBarActive,
        arrowsColor,
        backgroundColor,
        isDebugMode,
        forbidClose,
        autoplay,
        disableCache,
      };

      if (isDebugMode) {
        console.log('StoryModalWeb: Creating Story SDK instance with options:', options);
      }

      const storySDK = new StorySDKCore(token, options);
      storySDKInstanceRef.current = storySDK;

      // Set up event listeners for web
      const closeEvents = ['storyClose', 'storyModalClose', 'groupClose'];
      closeEvents.forEach(eventName => {
        storySDK.on(eventName, () => {
          stableOnClose();
        });
      });

      const events = [
        'groupClose', 'groupOpen', 'storyClose', 'storyOpen',
        'storyNext', 'storyPrev', 'widgetAnswer', 'widgetClick',
        'storyModalOpen', 'storyModalClose', 'dataLoaded', 'groupClick'
      ];

      events.forEach(eventName => {
        storySDK.on(eventName, (data: any) => {
          stableOnEvent(eventName, data);
        });
      });

      storySDK.on('error', (error: any) => {
        stableOnError({
          message: error.message || 'Story SDK Error',
          details: error.details || error.stack
        });
      });

      // Render stories for specific group
      if (webContainerRef.current) {
        if (isDebugMode) {
          console.log('StoryModalWeb: Rendering stories to container for group:', groupId, webContainerRef.current);
        }
        storySDK.renderGroups(webContainerRef.current);
      } else {
        throw new Error('Web container ref is null during rendering');
      }

      if (isDebugMode) {
        console.log('StoryModalWeb: Web SDK initialized successfully for group:', groupId);
      }

    } catch (error) {
      if (isDebugMode) {
        console.error('StoryModalWeb: Error initializing web SDK:', error);
        console.error('StoryModalWeb: StorySDKCore available:', !!StorySDKCore);
        console.error('StoryModalWeb: Container available:', !!webContainerRef.current);
        console.error('StoryModalWeb: GroupId:', groupId);
      }

      // Set local flag instead of modifying global StorySDKCore
      setWebSDKFailed(true);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      stableOnError({
        message: `Web SDK initialization failed: ${errorMessage}`,
        details: error instanceof Error ? error.stack : undefined
      });
    }
  }, [token, groupId, webSDKFailed, isShowMockup, isStatusBarActive, arrowsColor, backgroundColor, isDebugMode, forbidClose, autoplay, disableCache, stableOnClose, stableOnEvent, stableOnError]);

  // Web-specific initialization
  useEffect(() => {
    if (StorySDKCore && !webSDKFailed && webContainerRef.current && groupId) {
      initializeWebSDK();
      // Cleanup function
      return () => {
        if (storySDKInstanceRef.current) {
          try {
            if (isDebugMode) {
              console.log('StoryModalWeb: Cleaning up Story SDK instance');
            }
            storySDKInstanceRef.current.destroy();
          } catch (cleanupError) {
            console.warn('StoryModalWeb: Error during cleanup:', cleanupError);
          }
          storySDKInstanceRef.current = null;
        }
      };
    }
  }, [token, groupId]);

  // Iframe-specific initialization for web fallback
  useEffect(() => {
    if ((!StorySDKCore || webSDKFailed) && groupId) {
      // Set up message listener for iframe communication
      const handleIframeMessage = (event: MessageEvent) => {
        try {
          if (isDebugMode) {
            console.log('StoryModalWeb: Received iframe message:', event.data);
          }

          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

          // Only handle messages intended for this modal instance
          if (data.source !== 'storysdk-modal') {
            return;
          }

          stableOnEvent(data.type, data.data);

          // Handle close events
          if ((data.type === 'storyModalClose' || data.data?.actionType === 'close')) {
            stableOnClose();
          }

          // Handle other story events
          const closeEvents = ['storyClose', 'groupClose'];
          if (closeEvents.includes(data.type)) {
            stableOnClose();
          }
        } catch (error) {
          if (isDebugMode) {
            console.warn('StoryModalWeb: Error handling iframe message:', error);
          }
        }
      };

      window.addEventListener('message', handleIframeMessage);

      // Send initialization message to iframe once it's loaded
      const sendInitMessage = () => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          const options = {
            token,
            groupId,
            isShowMockup,
            isStatusBarActive,
            arrowsColor,
            backgroundColor,
            isDebugMode,
            forbidClose,
            autoplay,
            disableCache,
            platform: 'web',
            source: 'storysdk-modal', // Add source identifier
          };

          const message = {
            type: 'init',
            data: options,
          };

          iframeRef.current.contentWindow.postMessage(JSON.stringify(message), '*');

          if (isDebugMode) {
            console.log('StoryModalWeb: Sent init message to iframe:', message);
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
  }, [token, groupId, webSDKFailed, isShowMockup, isStatusBarActive, arrowsColor, backgroundColor, isDebugMode, forbidClose, autoplay, disableCache, stableOnClose, stableOnEvent]);

  // Reset webSDKFailed flag when token or groupId changes
  useEffect(() => {
    setWebSDKFailed(false);
  }, [token, groupId]);

  if (!groupId) {
    return null;
  }

  // Check if modal already exists
  if (typeof document !== 'undefined') {
    const isModalExist = document.querySelector('#storysdk-modal-root');
    if (isModalExist) {
      return null;
    }
  }

  if (!StorySDKCore || webSDKFailed) {
    // Iframe fallback for web platform when StorySDK Core is not available
    if (isDebugMode) {
      console.log('StoryModalWeb: Using iframe fallback on web platform');
    }

    const iframeUrl = `data:text/html;charset=utf-8,${encodeURIComponent(sdkHtml)}`;

    return (
      <View style={styles.fullScreenContainer}>
        <View style={styles.webviewContainer}>
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: backgroundColor || 'white'
            }}
            onLoad={() => {
              if (isDebugMode) {
                console.log('StoryModalWeb: Iframe loaded successfully');
              }
            }}
            onError={(error) => {
              if (isDebugMode) {
                console.error('StoryModalWeb: Iframe load error:', error);
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
      </View>
    );
  }

  // StorySDK Core direct rendering
  return (
    <View style={styles.fullScreenContainer}>
      <View style={styles.webviewContainer}>
        <div
          ref={webContainerRef}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: backgroundColor || 'white'
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
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
}); 