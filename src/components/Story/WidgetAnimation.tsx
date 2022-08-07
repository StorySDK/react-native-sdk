import React from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  PixelRatio,
  StyleSheet,
} from 'react-native';
import type { WidgetObjectType } from '../../types';
import { useKeyboardHeight } from '../../hooks';

interface WidgetAnimationProps {
  play?: boolean;
  type?: 'foreground';
  widget: WidgetObjectType;
}

const size = (value: number) =>
  Dimensions.get('window').width / (1080 / PixelRatio.get()) < 1
    ? value * (1080 / Dimensions.get('window').width)
    : value;

const WidgetAnimation: React.FC<WidgetAnimationProps> = (props) => {
  const { widget, play } = props;
  const keyboardHeight = useKeyboardHeight();

  const anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!play) {
      anim.setValue(0);
    }

    if (play) {
      Animated.timing(anim, {
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
        toValue: 1,
        duration: 150,
      }).start();
    }
  }, [anim, play]);

  const left = widget.position.x / PixelRatio.get();
  const top = widget.position.y / PixelRatio.get();
  const width = widget.position.realWidth / PixelRatio.get();
  const height = widget.position.realHeight / PixelRatio.get();

  const rotate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [`${widget.position.rotate}deg`, '0deg'],
  });

  const midX = size(Dimensions.get('window').width / 2);
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, midX - left - width / 2],
  });

  const midY = size((Dimensions.get('window').height - keyboardHeight) / 2);
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, midY - top - height / 2],
  });

  const fullWidth = 700 / PixelRatio.get();
  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, fullWidth > width ? fullWidth / width : width / fullWidth],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        play && styles.over,
        {
          left,
          top,
          width: widget.positionLimits.isAutoWidth ? 'auto' : width,
          height: widget.positionLimits.isAutoHeight ? 'auto' : height,
          transform: [{ rotate }, { translateX }, { translateY }, { scale }],
        },
      ]}
    >
      {props.children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  over: {
    elevation: 1000,
  },
});

export default WidgetAnimation;
