# StorySDK React Native

React Native components for displaying and managing stories with simplified cache management.

## Installation

```bash
npm install @storysdk/react-native
```

## Setup

Install required peer dependencies:

```bash
npm install @react-native-async-storage/async-storage react-native-webview
```

### For Web Platform Support

If you're using React Native Web and want to use Story SDK Core directly instead of WebView, also install:

```bash
npm install @storysdk/core
```

This will provide better performance and native web experience when your React Native app runs in a browser.

### iOS Setup

Configure your iOS project for proper media playback by adding to your `Info.plist`:

```xml
<key>UIBackgroundModes</key>
<array>
    <string>audio</string>
</array>
```

### Android Setup

Add to your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

## Platform Support

This SDK automatically detects the platform and uses the appropriate rendering method:

- **iOS/Android**: Uses WebView for story rendering
- **Web**: Uses @storysdk/core directly for better performance (if installed), falls back to WebView if not available

## Basic Usage

### Initialize Storage

```jsx
import { initializeStorage } from '@storysdk/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize storage once at app startup
initializeStorage(AsyncStorage);
```

### StoryGroups Component

Display a list of story groups:

```jsx
import React, { useState } from 'react';
import { StoryGroups, StoryModal } from '@storysdk/react-native';

const App = () => {
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  return (
    <>
      <StoryGroups
        token="YOUR_TOKEN"
        onGroupClick={(groupId) => setSelectedGroupId(groupId)}
        groupImageWidth={80}
        groupImageHeight={80}
        groupTitleSize={14}
      />
      
      {selectedGroupId && (
        <StoryModal
          token="YOUR_TOKEN"
          groupId={selectedGroupId}
          onClose={() => setSelectedGroupId(null)}
        />
      )}
    </>
  );
};

export default App;
```

### StoryModal Component

Display stories in a modal window:

```jsx
import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { StoryModal } from '@storysdk/react-native';

const App = () => {
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button
        title="Open Stories"
        onPress={() => setSelectedGroupId('your-group-id')}
      />
      
      {selectedGroupId && (
        <StoryModal
          token="YOUR_TOKEN"
          groupId={selectedGroupId}
          onClose={() => setSelectedGroupId(null)}
        />
      )}
    </View>
  );
};

export default App;
```

## Web Platform Considerations

When running on web platform (React Native Web):

1. **Automatic Detection**: The components automatically detect when running on web and use @storysdk/core if available
2. **Fallback**: If @storysdk/core is not installed, the components will fall back to WebView rendering
3. **Performance**: Using @storysdk/core directly provides better performance than WebView on web
4. **Styling**: Web platform rendering respects the same styling props as mobile platforms

### Example Web-Specific Usage

```jsx
import React from 'react';
import { Platform } from 'react-native';
import { StoryGroups } from '@storysdk/react-native';

const App = () => {
  return (
    <StoryGroups
      token="YOUR_TOKEN"
      onGroupClick={(groupId) => {
        if (Platform.OS === 'web') {
          // Web-specific handling
          console.log('Web platform: Group clicked', groupId);
        } else {
          // Mobile handling
          console.log('Mobile platform: Group clicked', groupId);
        }
      }}
      groupImageWidth={80}
      groupImageHeight={80}
      backgroundColor="transparent"
    />
  );
};

export default App;
```

## Cache Management

The SDK features a simplified cache management system through the `CacheManager` class that handles tokens and data caching for stories and groups.

### Component-Specific Caching

The SDK automatically manages cache for each component type independently:

- **StoryGroups**: Caches group lists and metadata with "groups" component type
- **StoryModal**: Caches story content and media with "modal" component type

### Automatic Cache Management

When you change tokens in any StorySDK component:

1. **Component Isolation**: Only the cache for that specific component type is affected
2. **Token Detection**: SDK detects token changes per component independently
3. **Automatic Clearing**: Old cache is automatically cleared when tokens change
4. **WebView Sync**: WebView cache is also cleared to ensure fresh content

### Cache Operations

```jsx
import { CacheManager } from '@storysdk/react-native';

// Clear cache for specific component and token
await CacheManager.clearComponentCache('groups', 'TOKEN_1');

// Clear all cache for specific token across all components
await CacheManager.clearTokenCache('TOKEN_1');

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

## Advanced Usage

### Custom Configuration

```jsx
import React from 'react';
import { StoryModal } from '@storysdk/react-native';

const App = () => {
  return (
    <StoryModal
      token="YOUR_TOKEN"
      groupId="your-group-id"
      isShowMockup={false}
      isStatusBarActive={true}
      arrowsColor="#ffffff"
      backgroundColor="#000000"
      isDebugMode={true}
      devMode="staging" // or "development"
      forbidClose={false}
      autoplay={true}
      disableCache={false}
      onClose={() => console.log('Modal closed')}
      onError={(error) => console.error('Error:', error)}
      onEvent={(event, data) => console.log('Event:', event, data)}
    />
  );
};

export default App;
```

### Debug Mode

Enable debug mode to see detailed logging:

```jsx
import { CacheManager } from '@storysdk/react-native';

// Enable debug mode
CacheManager.setDebugMode(true);

// Check if debug mode is enabled
const isDebugEnabled = CacheManager.getDebugMode();
```

### Cache Management Best Practices

```jsx
import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { CacheManager, initializeStorage } from '@storysdk/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize storage once at app startup
initializeStorage(AsyncStorage);

const App = () => {
  // Flush writes when app goes to background
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'background') {
        CacheManager.flushWrites();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  return (
    // Your app content
  );
};

export default App;
```

## API Reference

### StoryGroups Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `token` | `string` | **Required** | Your StorySDK token |
| `onGroupClick` | `(groupId: string) => void` | - | Callback when a group is clicked |
| `groupImageWidth` | `number` | 80 | Width of group images |
| `groupImageHeight` | `number` | 80 | Height of group images |
| `groupTitleSize` | `number` | 14 | Font size for group titles |
| `isDebugMode` | `boolean` | false | Enable debug logging |
| `devMode` | `'staging' \| 'development'` | - | Development mode |

### StoryModal Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `token` | `string` | **Required** | Your StorySDK token |
| `groupId` | `string` | - | ID of the story group to display |
| `isShowMockup` | `boolean` | false | Show mockup overlay |
| `isStatusBarActive` | `boolean` | - | Control status bar visibility |
| `arrowsColor` | `string` | - | Color of navigation arrows |
| `backgroundColor` | `string` | - | Background color |
| `isDebugMode` | `boolean` | false | Enable debug logging |
| `devMode` | `'staging' \| 'development'` | - | Development mode |
| `forbidClose` | `boolean` | false | Prevent closing the modal |
| `autoplay` | `boolean` | true | Auto-play stories |
| `disableCache` | `boolean` | false | Disable caching |
| `onClose` | `() => void` | - | Callback when modal closes |
| `onError` | `(error: {message: string, details?: string}) => void` | - | Error callback |
| `onEvent` | `(event: string, data: any) => void` | - | Event callback |

### CacheManager Methods

| Method | Description |
|--------|-------------|
| `initializeWithToken(componentType, token)` | Initialize component with token |
| `clearComponentCache(componentType, token)` | Clear cache for specific component |
| `clearTokenCache(token)` | Clear cache for all components using token |
| `clearAllCache()` | Clear all SDK cache |
| `flushWrites()` | Flush pending writes to storage |
| `setDebugMode(enabled)` | Enable/disable debug mode |

## Troubleshooting

### Cache Issues

If you're experiencing issues with old data being displayed after token change:

```jsx
import { CacheManager } from '@storysdk/react-native';

// Clear cache for specific component and token
await CacheManager.clearComponentCache('groups', 'OLD_TOKEN');

// Clear all cache for specific token
await CacheManager.clearTokenCache('OLD_TOKEN');

// Clear all SDK cache (nuclear option)
await CacheManager.clearAllCache();
```

### Debug Logging

Enable debug mode to see detailed information about cache operations:

```jsx
import { CacheManager } from '@storysdk/react-native';

CacheManager.setDebugMode(true);
```

## License

MIT License