# @storysdk/react-native-sdk

StorySDK - A service for creating and adding stories to mobile apps and websites. Realtime, no code solution.

Learn more: [storysdk.com](https://storysdk.com/)

[Documentation](https://docs.storysdk.com/getting-started/sdk-integration/reactnative)

## Installation

```sh
npm install @storysdk/react-native-sdk
```

Add the following dependencies to your project

```json lines
"@miblanchard/react-native-slider": "^2.1.0",
"react-native-device-info": "^8.7.1",
"react-native-modal": "^13.0.1",
"react-native-svg": "^12.3.0",
"react-native-text-gradient": "^0.1.7",
"react-native-video": "^5.2.0"
```

## Usage

```tsx
import { StorySDKComponent } from '@storysdk/react-native-sdk';

const token = "b881fa22-ef23-41f2-92a6-efb04b147834";

// ...

<StorySDKComponent token={token} />
```

## Get SDK token

To get the token, go to the app settings page and copy the content

<img src="https://3874095303-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-Mj3mk8X1lr8iYBWypC-%2Fuploads%2FXlprWHbxD6rachwLzw7Y%2FScreenshot%202022-04-24%20at%2020.21.02.png?alt=media&token=c0cfa168-607a-4bd1-aa3d-66505f6f2891" width="600" alt="Get SDK token"/>

## Documentation

The full documentation for StorySDK can be found [here](https://docs.storysdk.com/)
