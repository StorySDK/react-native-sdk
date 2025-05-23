# StorySDK React Native

**React Native adapter for StorySDK** - This package provides React Native components that use WebView to display stories powered by the `@storysdk/core` package. This adapter approach ensures cross-platform compatibility while leveraging the full functionality of the web-based StorySDK.

React Native components for StorySDK using WebView to display stories with automatic onboarding completion tracking and customizable storage options.

## Installation

```bash
npm install @storysdk/react-native react-native-webview
```

## AsyncStorage Configuration

By default, the SDK requires `@react-native-async-storage/async-storage` as a peer dependency. You have two options:

### Option 1: Use default AsyncStorage
Install the standard AsyncStorage package:

```bash
npm install @react-native-async-storage/async-storage
```

### Option 2: Use your own AsyncStorage implementation
If you want to use your own storage implementation (e.g., for custom encryption, different storage engines, etc.), you can initialize the SDK with your custom storage:

```jsx
import { initializeStorage } from '@storysdk/react-native';
import MyCustomAsyncStorage from 'your-custom-storage-package';

// Initialize the SDK with your custom storage
initializeStorage(MyCustomAsyncStorage);
```

Your custom storage must implement the following interface:

```typescript
interface AsyncStorageInterface {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  multiGet?(keys: string[]): Promise<readonly [string, string | null][]>; // optional
  multiSet?(keyValuePairs: Array<[string, string]>): Promise<void>; // optional
}
```

**Important**: Call `initializeStorage()` before using any StorySDK components to ensure proper storage functionality.

## Onboarding Storage Management

The SDK includes automatic onboarding completion tracking. When users complete an onboarding flow, their progress is automatically saved and the onboarding won't be shown again.

**Note**: Onboarding storage uses the same storage system as the main SDK. Any custom storage configured via `initializeStorage()` will automatically be used for onboarding data as well. This ensures consistent storage behavior and takes advantage of features like caching, batching, and error handling.

### Managing Onboarding Completion

```jsx
import { OnboardingStorage } from '@storysdk/react-native';

// Check if specific onboarding was completed
const isCompleted = await OnboardingStorage.isOnboardingCompleted(token, onboardingId);

// Mark onboarding as completed manually
await OnboardingStorage.markOnboardingCompleted(token, onboardingId);

// Reset onboarding completion (for testing/debugging)
await OnboardingStorage.resetOnboardingCompletion(token, onboardingId);

// Flush pending writes (call before app goes to background)
await OnboardingStorage.flushWrites();
```

## Usage

### StoryGroups

Component for displaying a list of story groups:

```jsx
import { StoryGroups } from '@storysdk/react-native';

// In your component
<StoryGroups
  token="YOUR_TOKEN"
  onGroupClick={(groupId) => {
    // Handle group click
    setSelectedGroupId(groupId);
  }}
  groupImageWidth={80}
  groupImageHeight={80}
  groupTitleSize={14}
/>
```

### StoryModal

Component for displaying stories in a modal window:

```jsx
import { StoryModal } from '@storysdk/react-native';

// In your component
<StoryModal
  token="YOUR_TOKEN"
  groupId={selectedGroupId}
  onClose={() => setSelectedGroupId(null)}
/>
```

### StoryOnboarding

Component specifically designed for onboarding flows with automatic completion tracking:

```jsx
import { StoryOnboarding } from '@storysdk/react-native';

// Basic usage - automatically tracks completion
<StoryOnboarding
  token="YOUR_TOKEN"
  onboardingId="YOUR_ONBOARDING_ID"
  onClose={() => console.log('Onboarding completed!')}
/>

// Advanced usage with manual control
<StoryOnboarding
  token="YOUR_TOKEN"
  onboardingId="YOUR_ONBOARDING_ID"
  forceShow={true} // Show even if completed before
  disableAutoSave={false} // Enable automatic completion saving
  isOpen={isOnboardingOpen}
  setIsOpen={setIsOnboardingOpen}
  onClose={() => console.log('Onboarding completed!')}
/>
```

## Props

### StoryGroups

- `token` (required) - Token for accessing StorySDK
- `onGroupClick` - Handler for group click events
- `groupImageWidth` - Width of group image in pixels
- `groupImageHeight` - Height of group image in pixels
- `groupTitleSize` - Font size of group title in pixels
- `groupClassName` - CSS class for styling individual group
- `groupsClassName` - CSS class for styling groups container
- `activeGroupOutlineColor` - Outline color for active group
- `groupsOutlineColor` - Outline color for all groups
- `arrowsColor` - Color of navigation arrows
- `backgroundColor` - Background color of the component
- `onError` - Error handler callback that receives error details
- `onEvent` - Event handler callback that receives event type and associated data

### StoryModal

- `token` (required) - Token for accessing StorySDK
- `groupId` - Group ID to display
- `onClose` - Handler for modal close event
- `isShowMockup` - Whether to show device mockup around stories
- `isShowLabel` - Whether to show labels
- `isStatusBarActive` - Whether status bar is active
- `autoplay` - Automatically play through stories
- `arrowsColor` - Color of navigation arrows
- `backgroundColor` - Background color of the component
- `forbidClose` - Prevent modal from being closed
- `onError` - Error handler callback that receives error details
- `onEvent` - Event handler callback that receives event type and associated data

### StoryOnboarding

- `token` (required) - Token for accessing StorySDK
- `onboardingId` (required) - ID of the onboarding flow
- `isShowMockup` - Whether to show device mockup around stories
- `isStatusBarActive` - Whether status bar is active
- `arrowsColor` - Color of navigation arrows
- `backgroundColor` - Background color of the component
- `isDebugMode` - Enable debug mode
- `devMode` - Development mode ('staging' | 'development')
- `forbidClose` - Prevent modal from being closed (useful for critical onboarding flows)
- `onClose` - Handler for onboarding completion
- `onError` - Error handler callback that receives error details
- `onEvent` - Event handler callback that receives event type and associated data
- `isOpen` - Control the visibility of the onboarding modal externally
- `setIsOpen` - Function to control the visibility of the onboarding modal externally
- `forceShow` - Force show onboarding even if it was completed before (useful for testing)
- `disableAutoSave` - Disable automatic saving of onboarding completion

## SDK Events

All components can handle the following events through the `onEvent` prop:

- `groupClose` - Group of stories closed
- `groupOpen` - Group of stories opened
- `storyClose` - Story closed
- `storyOpen` - Story opened
- `storyNext` - Navigation to next story
- `storyPrev` - Navigation to previous story
- `widgetAnswer` - User response to a widget
- `widgetClick` - Widget click
- `storyModalOpen` - Modal window opened
- `storyModalClose` - Modal window closed
- `groupClick` - Story group clicked

### onEvent Usage Example

```jsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { StoryGroups, StoryModal, StoryOnboarding } from '@storysdk/react-native';

const App = () => {
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const handleEvent = (eventType, eventData) => {
    console.log(`Event: ${eventType}`, eventData);
    
    // Example of handling a specific event
    if (eventType === 'widgetClick') {
      console.log('User clicked on a widget:', eventData);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StoryGroups
        token="YOUR_TOKEN"
        onGroupClick={setSelectedGroupId}
        onEvent={handleEvent}
      />
      <StoryModal
        token="YOUR_TOKEN"
        groupId={selectedGroupId}
        onClose={() => setSelectedGroupId(null)}
        onEvent={handleEvent}
      />
      <StoryOnboarding
        token="YOUR_TOKEN"
        onboardingId="YOUR_ONBOARDING_ID"
        onEvent={handleEvent}
      />
    </View>
  );
};

export default App;
```

## Usage Examples

### Standard Story Implementation

```jsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { StoryGroups, StoryModal } from '@storysdk/react-native';

const App = () => {
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  return (
    <View style={{ flex: 1 }}>
      <StoryGroups
        token="YOUR_TOKEN"
        onGroupClick={setSelectedGroupId}
      />
      <StoryModal
        token="YOUR_TOKEN"
        groupId={selectedGroupId}
        onClose={() => setSelectedGroupId(null)}
      />
    </View>
  );
};

export default App;
```

### Simple Onboarding with Automatic Tracking

```jsx
import React from 'react';
import { View } from 'react-native';
import { StoryOnboarding } from '@storysdk/react-native';

const App = () => {
  return (
    <View style={{ flex: 1 }}>
      {/* Your app content */}
      
      {/* Onboarding with automatic completion tracking */}
      <StoryOnboarding
        token="YOUR_TOKEN"
        onboardingId="welcome-onboarding"
        onClose={() => console.log('User completed onboarding!')}
      />
    </View>
  );
};

export default App;
```

### Advanced Onboarding with Manual Control

```jsx
import React, { useState, useEffect } from 'react';
import { View, Button, AppState } from 'react-native';
import { StoryOnboarding, OnboardingStorage, initializeStorage } from '@storysdk/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize storage once at app startup
initializeStorage(AsyncStorage);

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const token = "YOUR_TOKEN";
  const onboardingId = "welcome-onboarding";
  
  // Check onboarding status on app start
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const isCompleted = await OnboardingStorage.isOnboardingCompleted(token, onboardingId);
        if (!isCompleted) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Show onboarding on error as fallback
        setShowOnboarding(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkOnboardingStatus();
  }, []);

  // Flush writes when app goes to background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background') {
        OnboardingStorage.flushWrites();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);
  
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    console.log('User completed onboarding!');
  };

  const resetOnboarding = async () => {
    await OnboardingStorage.resetOnboardingCompletion(token, onboardingId);
    setShowOnboarding(true);
  };

  if (isLoading) {
    return <View style={{ flex: 1 }} />; // Loading state
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Your app content */}
      <Button title="Reset Onboarding" onPress={resetOnboarding} />
      
      {/* Onboarding with manual control */}
      <StoryOnboarding
        token={token}
        onboardingId={onboardingId}
        isOpen={showOnboarding}
        setIsOpen={setShowOnboarding}
        onClose={handleOnboardingComplete}
        forbidClose={false} // Set to true if onboarding must be completed
      />
    </View>
  );
};

export default App;
```

### Testing Onboarding

```jsx
import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { StoryOnboarding, OnboardingStorage } from '@storysdk/react-native';

const TestOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const token = "YOUR_TOKEN";
  const onboardingId = "test-onboarding";

  const showOnboardingForTesting = () => {
    setShowOnboarding(true);
  };

  const checkCompletionStatus = async () => {
    const isCompleted = await OnboardingStorage.isOnboardingCompleted(token, onboardingId);
    console.log('Onboarding completed:', isCompleted);
  };

  const resetCompletion = async () => {
    await OnboardingStorage.resetOnboardingCompletion(token, onboardingId);
    console.log('Onboarding completion reset');
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button title="Show Onboarding" onPress={showOnboardingForTesting} />
      <Button title="Check Completion Status" onPress={checkCompletionStatus} />
      <Button title="Reset Completion" onPress={resetCompletion} />
      
      <StoryOnboarding
        token={token}
        onboardingId={onboardingId}
        forceShow={true} // Always show for testing
        disableAutoSave={false} // Enable auto-save for testing
        isOpen={showOnboarding}
        setIsOpen={setShowOnboarding}
        onClose={() => {
          setShowOnboarding(false);
          console.log('Onboarding completed!');
        }}
      />
    </View>
  );
};
```

## Media Background Playback Permissions

For proper background media playback (audio/video), you need to configure additional permissions in your project:

### iOS

Add the following to your iOS project's `Info.plist` file:

```xml
<key>UIBackgroundModes</key>
<array>
    <string>audio</string>
</array>
```

### Android

Add the following to your Android project's `AndroidManifest.xml` file:

```xml
<uses-permission android:name="android.permission.WAKE_LOCK" />
```