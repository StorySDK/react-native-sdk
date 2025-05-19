import React, { useState } from 'react';
import { StoryModal } from './StoryModal';

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
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(true);

  const isOpen = externalIsOpen ?? internalIsOpen;
  const setIsOpen = externalSetIsOpen ?? setInternalIsOpen;

  if (!isOpen) {
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
    onClose={() => {
      setIsOpen(false);
      onClose?.();
    }}
    onError={onError}
    onEvent={onEvent}
  />;
}; 