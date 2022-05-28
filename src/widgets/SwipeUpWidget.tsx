import React from 'react';
import { Image, Pressable, Linking } from 'react-native';
import type { SwipeUpWidgetParamsType } from '../types';

interface Props {
  params: SwipeUpWidgetParamsType;
  widgetImage: string;

  onSwipe?(): void;
}

export const SwipeUpWidget: React.FC<Props> = ({
  params,
  widgetImage,
  onSwipe,
}) => {
  const handlePress = async () => {
    onSwipe && onSwipe();
    const supported = await Linking.canOpenURL(params.url);

    if (supported) {
      await Linking.openURL(params.url);
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <Image
        source={{ uri: widgetImage }}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </Pressable>
  );
};
