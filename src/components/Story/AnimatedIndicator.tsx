import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import type { PlayStatusType } from '../../types';

interface Props {
  playStatus: PlayStatusType;
  onNext(): void;
}

const AnimatedIndicator: React.FC<Props> = (props) => {
  const { playStatus } = props;

  const anim = React.useRef(new Animated.Value(0)).current;
  const [value, setValue] = React.useState<number>(0);

  React.useEffect(() => {
    if (playStatus === 'pause') {
      anim.stopAnimation((v) => {
        setValue(v);
        anim.setValue(0);
      });
    }

    if (playStatus === 'play') {
      anim.setValue(value);
    }
  }, [anim, playStatus]);

  React.useEffect(() => {
    if (playStatus === 'play') {
      Animated.timing(anim, {
        useNativeDriver: false,
        toValue: 100,
        duration: 7000,
      }).start((event: Animated.EndResult) => {
        event.finished && props.onNext();
      });
    }
  }, [anim, playStatus]);

  const width =
    playStatus === 'play'
      ? anim.interpolate({
          inputRange: [0, 100],
          outputRange: ['0%', '100%'],
        })
      : `${value}%`;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width,
        },
      ]}
    />
  );
};

function propsAreEqual(prev: Props, next: Props) {
  return prev.playStatus === next.playStatus;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});

export default React.memo(AnimatedIndicator, propsAreEqual);
