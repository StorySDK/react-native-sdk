import React from 'react';
import { Image, Pressable, Linking } from 'react-native';
import type { SwipeUpWidgetParamsType } from '../../types';
import Reactions from '../../core/Reactions';

interface Props {
  params: SwipeUpWidgetParamsType;
  widgetImage: string;
  widgetId: string;
}

export const SwipeUpWidget: React.FC<Props> = ({
  params,
  widgetImage,
  widgetId,
}) => {
  const handlePress = async () => {
    Reactions.registerWidget(widgetId);
    Reactions.send('click');

    if (params.url) {
      Linking.canOpenURL(params.url).then((can) => {
        if (can) {
          Linking.openURL(params.url);
        }
      });
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
