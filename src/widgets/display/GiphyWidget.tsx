import React from 'react';
import { Image } from 'react-native';
import type { GiphyWidgetParamsType } from '../../types';

interface Props {
  params: GiphyWidgetParamsType;
}

export const GiphyWidget: React.FC<Props> = ({ params }) => {
  return (
    <Image
      source={{ uri: params.gif }}
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  );
};
