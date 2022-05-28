import React from 'react';
import { Animated } from 'react-native';

export const useSpiritAnim = () => {
  const popUpAnim = React.useRef(new Animated.Value(0)).current;
  const startPopUpAnim = () =>
    Animated.timing(popUpAnim, {
      useNativeDriver: false,
      toValue: -100,
      duration: 1500,
    }).start();

  const opacityAnim = React.useRef(new Animated.Value(1)).current;
  const startOpacityAnim = () =>
    Animated.timing(opacityAnim, {
      useNativeDriver: false,
      toValue: 0,
      duration: 1500,
    }).start();

  const startAnim = () => {
    startPopUpAnim();
    startOpacityAnim();
  };

  return {
    animStyles: { top: popUpAnim, opacity: opacityAnim },
    startAnim,
  };
};
