import React from 'react';
import { Image, Pressable, Linking } from 'react-native';
import type { ClickMeWidgetParamsType } from '../types';

interface Props {
  params: ClickMeWidgetParamsType;
  widgetImage: string;

  onClick?(): void;
}

export const ClickMeWidget: React.FC<Props> = ({
                                                 params,
                                                 widgetImage,
                                                 onClick,
                                               }) => {
  const handlePress = async () => {
    onClick && onClick();
    const supported = await Linking.canOpenURL(params.url);

    if (supported) {
      await Linking.openURL(params.url);
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <Image
        source={{
          uri: widgetImage,
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </Pressable>
  );
};
