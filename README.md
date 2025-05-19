# StorySDK React Native

⚠️ **Important Notice**: This is not a full-fledged React Native SDK, but rather an adapter that uses WebView to display stories. It relies on the `@storysdk/core` package for core functionality. This implementation may have some limitations compared to native implementations.

React Native components for StorySDK using WebView to display stories.

## Installation

```bash
npm install @storysdk/react-native react-native-webview
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

Component specifically designed for onboarding flows:

```jsx
import { StoryOnboarding } from '@storysdk/react-native';

// In your component
<StoryOnboarding
  token="YOUR_TOKEN"
  onboardingId="YOUR_ONBOARDING_ID"
  onClose={() => setOnboardingComplete(true)}
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
  const [showOnboarding, setShowOnboarding] = useState(true);

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
        isOpen={showOnboarding}
        setIsOpen={setShowOnboarding}
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

### Onboarding Implementation

```jsx
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { StoryOnboarding } from '@storysdk/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
        if (onboardingCompleted !== 'true') {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };
    
    checkOnboardingStatus();
  }, []);
  
  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Your app content */}
      
      {/* Onboarding component */}
      <StoryOnboarding
        token="YOUR_TOKEN"
        onboardingId="YOUR_ONBOARDING_ID"
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