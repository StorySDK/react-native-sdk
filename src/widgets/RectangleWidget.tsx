import React from 'react';
import { View } from 'react-native';
import type { RectangleWidgetParamsType } from '../types';
import { stylesUtils } from '../utils';

interface Props {
  params: RectangleWidgetParamsType;
}

export const RectangleWidget: React.FC<Props> = ({ params }) => {
  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: stylesUtils.renderBackground(params.fillColor),
        borderColor: params.strokeColor.value,
        borderWidth: params.strokeThickness,
        shadowColor: '#000000',
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 5,
      }}
    />
  );
};
