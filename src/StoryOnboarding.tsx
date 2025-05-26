import React, { useState, useEffect } from 'react';
import { StoryModal } from './StoryModal';
import { OnboardingStorage } from './OnboardingStorage';
import { TokenManager } from './TokenManager';

interface StoryOnboardingProps {
  token: string;
  onboardingId: string;
  isShowMockup?: boolean;
  isStatusBarActive?: boolean;
  arrowsColor?: string;
  backgroundColor?: string;
  isDebugMode?: boolean;
  devMode?: 'staging' | 'development';
  forbidClose?: boolean;
  onClose?: () => void;
  onError?: (error: { message: string, details?: string }) => void;
  onEvent?: (event: string, data: any) => void;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  forceShow?: boolean;
  disableAutoSave?: boolean;
}

/**
 * Component for displaying onboarding using StoryModal
 */

export const StoryOnboarding: React.FC<StoryOnboardingProps> = ({
  token,
  onboardingId,
  isShowMockup,
  isStatusBarActive,
  arrowsColor,
  backgroundColor,
  isDebugMode,
  devMode,
  forbidClose,
  onClose,
  onError,
  onEvent,
  isOpen: externalIsOpen,
  setIsOpen: externalSetIsOpen,
  forceShow = false,
  disableAutoSave = false,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize token and clear cache if token changed
  useEffect(() => {
    const initializeToken = async () => {
      try {
        const cacheCleared = await TokenManager.initializeWithToken(token);
        if (cacheCleared && isDebugMode) {
          console.log('StoryOnboarding: Cache cleared due to token change');
        }
      } catch (error) {
        if (isDebugMode) {
          console.warn('StoryOnboarding: Error initializing token:', error);
        }
      }
    };

    initializeToken();
  }, [token, isDebugMode]);

  // Check onboarding completion state on mount
  useEffect(() => {
    const checkOnboardingCompletion = async () => {
      try {
        // If developer controls state manually, don't check saved state
        if (externalIsOpen !== undefined) {
          setIsLoading(false);
          return;
        }

        // If forceShow is true, show onboarding regardless of previous state
        if (forceShow) {
          setInternalIsOpen(true);
          setIsLoading(false);
          return;
        }

        // Check if onboarding was completed before
        const isCompleted = await OnboardingStorage.isOnboardingCompleted(token, onboardingId);

        // Show onboarding only if it wasn't completed
        setInternalIsOpen(!isCompleted);
      } catch (error) {
        // In case of error, show onboarding (safe fallback)
        setInternalIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingCompletion();
  }, [token, onboardingId, externalIsOpen, forceShow]);

  // Determine current onboarding open state
  const isOpen = externalIsOpen ?? internalIsOpen;
  const setIsOpen = externalSetIsOpen ?? setInternalIsOpen;

  // Close handler with state saving
  const handleClose = async () => {
    try {
      // Save completion state if auto-save is not disabled
      if (!disableAutoSave) {
        await OnboardingStorage.markOnboardingCompleted(token, onboardingId);
      }
    } catch (error) {
      // Don't block closing in case of save error
      console.warn('Failed to save onboarding completion:', error);
    }

    // Close onboarding
    setIsOpen(false);

    // Call user handler
    onClose?.();
  };

  // Show null during loading or if onboarding should not be open
  if (isLoading || !isOpen) {
    return null;
  }

  return <StoryModal
    token={token}
    groupId={onboardingId}
    isShowMockup={isShowMockup}
    isStatusBarActive={isStatusBarActive}
    arrowsColor={arrowsColor}
    backgroundColor={backgroundColor}
    isDebugMode={isDebugMode}
    devMode={devMode}
    forbidClose={forbidClose}
    autoplay={true}
    isOnboarding={true}
    onClose={handleClose}
    onError={onError}
    onEvent={onEvent}
  />;
}; 