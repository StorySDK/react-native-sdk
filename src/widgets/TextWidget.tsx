import React from 'react';
import { Image } from 'react-native';
import type { TextWidgetParamsType } from '../types';

interface Props {
  params: TextWidgetParamsType;
  widgetImage: string;
}

export const TextWidget: React.FC<Props> = ({ widgetImage }) => {
  return (
    <Image
      source={{ uri: widgetImage }}
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  );
};
