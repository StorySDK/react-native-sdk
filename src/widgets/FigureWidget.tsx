import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { View, StyleSheet, Image } from 'react-native';
import type {
  RectangleWidgetParamsType,
  EllipseWidgetParamsType,
} from '../types';
import { stylesUtils } from '../utils';

interface RectangleProps {
  params: RectangleWidgetParamsType;
  type: 'rectangle';
}

interface EllipseProps {
  params: EllipseWidgetParamsType;
  type: 'ellipse';
}

export const FigureWidget: React.FC<RectangleProps | EllipseProps> = ({
  params,
  type,
}) => {
  const borderRadius = type === 'rectangle' ? params.fillBorderRadius : 5000;
  const borderStyles = params.hasBorder
    ? {
        borderColor: params.strokeColor.value,
        borderWidth: params.strokeThickness,
        borderRadius,
      }
    : { borderRadius };

  if (params.fillColor.type === 'gradient') {
    return (
      <LinearGradient
        colors={params.fillColor.value}
        style={[styles.container, borderStyles]}
      />
    );
  }

  if (params.fillColor.type === 'image') {
    return (
      <Image
        source={{ uri: params.fillColor.value }}
        style={[styles.container, borderStyles]}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        borderStyles,
        {
          backgroundColor: stylesUtils.renderBackground(params.fillColor),
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
});
