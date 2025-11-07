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
import { CacheManager } from '@storysdk/react-native';

// Check if specific onboarding was completed
const isCompleted = await CacheManager.isOnboardingCompleted(token, onboardingId);

// Mark onboarding as completed manually
await CacheManager.markOnboardingCompleted(token, onboardingId);

// Reset onboarding completion (for testing/debugging)
await CacheManager.resetOnboardingCompletion(token, onboardingId);

// Flush pending writes (call before app goes to background)
await CacheManager.flushWrites();
```

## Cache Management System

The SDK features a unified cache management system through the `CacheManager` class that handles tokens, data caching, and onboarding completion state. Each component type (StoryGroups, StoryModal, StoryOnboarding) maintains separate cache namespaces to prevent conflicts.

### Component-Specific Caching

The SDK automatically manages cache for each component type independently:

- **StoryGroups**: Caches group lists and metadata with "groups" component type
- **StoryModal**: Caches story content and media with "modal" component type  
- **StoryOnboarding**: Caches onboarding flows and completion state with "onboarding" component type

### Automatic Cache Management

When you change tokens in any StorySDK component:

1. **Component Isolation**: Only the cache for that specific component type is affected
2. **Token Detection**: SDK detects token changes per component independently
3. **Selective Clearing**: Only cached data for the previous token and component type is cleared
4. **Shared Token Support**: Multiple components can safely use the same token

This allows you to use `StoryGroups` and `StoryOnboarding` together with different tokens without cache conflicts.

### CacheManager API

The `CacheManager` provides a unified interface for all caching operations:

```jsx
import { CacheManager } from '@storysdk/react-native';

// Token Management
// Initialize specific component with token
const cacheCleared = await CacheManager.initializeWithToken('groups', 'TOKEN_1');

// Legacy API for backward compatibility  
const cacheCleared = await CacheManager.initializeWithToken('TOKEN_1');

// Note: getCurrentToken is deprecated. Always use token from props instead.
// Tokens are passed directly to components from props and should not be cached.

// Get overview of all component tokens
const tokensInfo = CacheManager.getComponentTokensInfo();
// Returns: { groups: 'TOKEN_1', modal: 'TOKEN_2', onboarding: 'TOKEN_1' }

// Check for token conflicts (multiple components using same token)
const hasConflicts = CacheManager.hasTokenConflicts();
```

### Data Cache Management

Advanced data caching with TTL and version control:

```jsx
import { CacheManager } from '@storysdk/react-native';

// Cache data for specific component and token
await CacheManager.setData(
  'groups',           // component type
  'TOKEN_1',          // token
  'groupsList',       // data type
  groupsData,         // data to cache
  10 * 60 * 1000     // TTL in milliseconds (10 minutes)
);

// Retrieve cached data
const cachedData = await CacheManager.getData('groups', 'TOKEN_1', 'groupsList');

// Check if data exists (without checking expiration)
const exists = await CacheManager.hasData('groups', 'TOKEN_1', 'groupsList');

// Remove specific data from cache
await CacheManager.removeData('groups', 'TOKEN_1', 'groupsList');

// Preload cache for better performance
await CacheManager.preloadCache('groups', 'TOKEN_1', ['groupsList', 'groupsMetadata']);
```

### Onboarding Management

Built-in onboarding completion tracking:

```jsx
import { CacheManager } from '@storysdk/react-native';

// Check if onboarding was completed
const isCompleted = await CacheManager.isOnboardingCompleted('TOKEN_1', 'welcome');

// Mark onboarding as completed
await CacheManager.markOnboardingCompleted('TOKEN_1', 'welcome');

// Reset onboarding completion (for testing)
await CacheManager.resetOnboardingCompletion('TOKEN_1', 'welcome');

// Preload onboarding data
await CacheManager.preloadOnboardings('TOKEN_1', ['welcome', 'tutorial']);
```

### Cache Clearing Operations

Granular cache clearing capabilities:

```jsx
import { CacheManager } from '@storysdk/react-native';

// Clear cache for specific component and current token
await CacheManager.clearCurrentTokenCache('groups');

// Clear cache for specific component and token
await CacheManager.clearComponentTokenCache('groups', 'TOKEN_1');

// Clear data cache for specific component and token
await CacheManager.clearComponentTokenDataCache('groups', 'TOKEN_1');

// Clear all data cache for a token across all components
await CacheManager.clearTokenDataCache('TOKEN_1');

// Clear onboarding cache for specific token
await CacheManager.clearOnboardingTokenCache('TOKEN_1');

// Clear all SDK cache (nuclear option)
await CacheManager.clearAllCache();

// Flush pending writes to storage
await CacheManager.flushWrites();
```

### Cache Clearing Behavior

- **Component-Specific**: Changing token for StoryGroups only affects StoryGroups cache
- **Token Isolation**: Each component maintains separate cache even with same token
- **Version Control**: Cache is automatically invalidated when SDK version changes
- **TTL Support**: Cached data expires automatically based on configured TTL
- **Error Handling**: Cache is cleared safely if errors occur during token operations
- **Debug Logging**: Cache operations are logged when `isDebugMode` is enabled

### Multiple Components Example

```jsx
// Using different tokens for different components - no cache conflicts
<StoryGroups token="TOKEN_USER_1" />
<StoryOnboarding token="TOKEN_USER_2" onboardingId="welcome" />

// Using same token for different components - separate cache namespaces
<StoryGroups token="SHARED_TOKEN" />
<StoryOnboarding token="SHARED_TOKEN" onboardingId="tutorial" />
```

## Build Configuration

The SDK uses environment variables for build-time configuration. The bundle version is managed through the `.env` file and automatically synchronized with `package.json`.

### Bundle Version Management

The SDK bundle version is controlled through environment variables and affects both JavaScript bundles and CSS stylesheets:

```bash
# .env file
BUNDLE_VERSION=1.9.0
```

When the bundle version changes, the following resources are automatically updated:
- JavaScript bundle: `@storysdk/core@{version}/dist/bundle.umd.js`
- CSS stylesheet: `@storysdk/core@{version}/dist/bundle.css`
- Cache keys for local storage

### Scripts

- `npm run build` - Build the SDK with the version from .env
- `npm run sync-version` - Synchronize .env version with package.json version
- `npm run dev` - Build in development mode with watching

### Version Synchronization

When you update the version in `package.json`, run the sync command to update `.env`:

```bash
npm run sync-version
```

This ensures that the bundle version in the SDK HTML file matches your package version.

### Custom Bundle Version

You can set a custom bundle version by either:

1. **Using .env file** (recommended):
   ```bash
   echo "BUNDLE_VERSION=1.9.1" > .env
   npm run build
   ```

2. **Using environment variable**:
   ```bash
   BUNDLE_VERSION=1.9.1 npm run build
   ```

If no `BUNDLE_VERSION` is set, the build process will fallback to the version from `package.json`.

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

## Migration Guide

### From TokenManager and OnboardingStorage to CacheManager

If you're upgrading from previous versions that used `TokenManager` and `OnboardingStorage` separately, these classes have been unified into `CacheManager`. The API remains the same for backward compatibility:

**Old way (still works):**
```jsx
import { TokenManager, OnboardingStorage } from '@storysdk/react-native';

await TokenManager.initializeWithToken('TOKEN');
await OnboardingStorage.markOnboardingCompleted('TOKEN', 'id');
```

**New recommended way:**
```jsx
import { CacheManager } from '@storysdk/react-native';

await CacheManager.initializeWithToken('TOKEN');
await CacheManager.markOnboardingCompleted('TOKEN', 'id');
```

Both approaches work identically due to legacy exports, but using `CacheManager` directly is recommended for new code as it provides the complete API in a single class.

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
import { StoryOnboarding, CacheManager, initializeStorage } from '@storysdk/react-native';
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
        const isCompleted = await CacheManager.isOnboardingCompleted(token, onboardingId);
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
        CacheManager.flushWrites();
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
    await CacheManager.resetOnboardingCompletion(token, onboardingId);
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
import { StoryOnboarding, CacheManager } from '@storysdk/react-native';

const TestOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const token = "YOUR_TOKEN";
  const onboardingId = "test-onboarding";

  const showOnboardingForTesting = () => {
    setShowOnboarding(true);
  };

  const checkCompletionStatus = async () => {
    const isCompleted = await CacheManager.isOnboardingCompleted(token, onboardingId);
    console.log('Onboarding completed:', isCompleted);
  };

  const resetCompletion = async () => {
    await CacheManager.resetOnboardingCompletion(token, onboardingId);
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

## Cache Troubleshooting

### Problem: Old data is displayed after token change

If old groups/data are still displayed after changing the token, try the following solutions:

#### Web SDK Cache Keys Reference

The React Native SDK automatically clears the following cache keys from the Web SDK when tokens change:

**API Cache (server responses):**
- `storysdk_api_cache_${token}_/app` - App configuration data
- `storysdk_api_cache_${token}_/groups` - Groups list data  
- `storysdk_api_cache_${token}_/groups/${groupId}/stories` - Stories for specific group

**Adapted Data Cache (processed UI data):**
- `storysdk_adapted_${token}_${language}_${userId}` - Processed stories data (new format)
- `storysdk_adapted_${token}_${language}_${userId}_groups_only` - Groups-only adapted data
- `storysdk_adapted_${token}_${language}_${userId}_with_stories` - Groups with stories
- `storysdk_adapted_data_${token}_${language}_${userId}` - Legacy adapted data format

**Raw Data Cache:**
- `storysdk_groups_${token}_${language}_${userId}` - Raw groups data
- `storysdk_stories_${token}_${language}_${userId}_group_${groupId}` - Stories for specific group
- `storysdk_app_${token}_${language}_${userId}` - App configuration

**User Identity Cache:**
- `storysdk_user_id` - Current user ID format
- `uniq_user_id` - Legacy user ID format

**WebView Script/CSS Cache:**
- `storysdk:script:${bundleVersion}` - Cached JavaScript bundle
- `storysdk:css:${bundleVersion}` - Cached CSS bundle
- `storysdk:script:${bundleVersion}:${tokenHash}` - Token-specific script cache
- `storysdk:css:${bundleVersion}:${tokenHash}` - Token-specific CSS cache

#### 1. Standard cache clearing
```typescript
import { CacheManager } from '@storysdk/react-native-sdk';

// Clear all SDK cache
await CacheManager.clearAllCache();
```

#### 2. Aggressive cache clearing (if standard doesn't help)
```typescript
// Aggressive clearing of all caches including WebView localStorage
await CacheManager.clearAllCacheAggressive();
```

#### 3. Disable caching
```typescript
<StoryGroups 
  token="NEW_TOKEN"
  disableCache={true}  // Disables all types of caching
  onGroupClick={handleGroupClick}
/>
```

#### 4. Cache state diagnostics
```typescript
// Get information about current cache state
const diagnostics = await CacheManager.diagnoseCacheState('groups', 'YOUR_TOKEN');
console.log('Cache diagnostics:', diagnostics);
```

#### 5. Force WebView reload
The component automatically reloads WebView when token changes, but if the problem persists, make sure that:
- You are passing the new token as a prop
- `disableCache={true}` is set temporarily for testing
- You call `clearAllCacheAggressive()` before changing the token

### Steps to take when encountering cache issues:

1. **First step** - try standard clearing:
   ```typescript
   await CacheManager.clearAllCache();
   ```

2. **If that doesn't help** - use aggressive clearing:
   ```typescript
   await CacheManager.clearAllCacheAggressive();
   ```

3. **For testing** - temporarily disable caching:
   ```typescript
   <StoryGroups disableCache={true} token="NEW_TOKEN" />
   ```

4. **For debugging** - examine cache state:
   ```typescript
   const diagnostics = await CacheManager.diagnoseCacheState('groups', 'YOUR_TOKEN');
   ```