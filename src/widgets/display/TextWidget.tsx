import React from 'react';
import { Image, PixelRatio, Text } from 'react-native';
import type {
  TextWidgetParamsType,
  WidgetPositionLimitsType,
  WidgetPositionType,
} from '../../types';

interface Props {
  params: TextWidgetParamsType;
  position: WidgetPositionType;
  positionLimits: WidgetPositionLimitsType;
  widgetImage?: string;
}

export const TextWidget: React.FC<Props> = (props) => {
  const { widgetImage, position, params } = props;

  if (!widgetImage) {
    return (
      <Text style={{ textAlign: params.align as any }}>{params.text}</Text>
    );
  }

  return (
    <Image
      source={{ uri: widgetImage }}
      style={[
        {
          width: position.origin.width / PixelRatio.get(),
          height: position.origin.height / PixelRatio.get(),
        },
      ]}
    />
  );
};
