import React from 'react';
import { Image, PixelRatio } from 'react-native';
import type {
  TextWidgetParamsType,
  WidgetPositionLimitsType,
  WidgetPositionType,
} from '../../types';

interface Props {
  params: TextWidgetParamsType;
  position: WidgetPositionType;
  positionLimits: WidgetPositionLimitsType;
  widgetImage: string;
}

export const TextWidget: React.FC<Props> = (props) => {
  const { widgetImage, position } = props;

  return (
    <Image
      source={{ uri: widgetImage }}
      style={[
        {
          width: position.width / PixelRatio.get(),
          height: position.height / PixelRatio.get(),
        },
      ]}
    />
  );
};
