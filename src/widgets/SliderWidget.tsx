import React, { useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Slider } from '@miblanchard/react-native-slider';
import type {
  SliderWidgetParamsType,
  WidgetPositionLimitsType,
  WidgetPositionType,
} from '../types';
import Emoji from '../components/Emoji';
import { useSpiritAnim } from '../hooks';
import { stylesUtils } from '../utils';

interface Props {
  params: SliderWidgetParamsType;
  position: WidgetPositionType;
  positionLimits: WidgetPositionLimitsType;

  onSlide?(value: number): void;
}

const INIT_ELEMENT_STYLES = {
  widget: {
    borderRadius: 10,
  },
  emoji: {
    width: 30,
    height: 30,
  },
  text: {
    fontSize: 16,
    marginBottom: 15,
  },
  slider: {
    height: 11,
    borderRadius: 6,
  },
};

export const SliderWidget: React.FC<Props> = ({
  params,
  onSlide,
  position,
  positionLimits,
}) => {
  const [value, setValue] = useState(params.value || 0);
  const [status, setStatus] = useState<'init' | 'moving' | 'moved'>('init');
  const { animStyles, startAnim } = useSpiritAnim();

  const calculate = (size: number) => {
    if (position && positionLimits) {
      return stylesUtils.calculateElementSize(position, positionLimits, size);
    }

    return size;
  };

  const elementSizes = React.useMemo(
    () => ({
      widget: {
        borderRadius: calculate(INIT_ELEMENT_STYLES.widget.borderRadius),
      },
      emoji: {
        width: calculate(INIT_ELEMENT_STYLES.emoji.width),
      },
      text: {
        fontSize: calculate(INIT_ELEMENT_STYLES.text.fontSize),
        marginBottom: calculate(INIT_ELEMENT_STYLES.text.marginBottom),
      },
      slider: {
        height: calculate(INIT_ELEMENT_STYLES.slider.height),
        borderRadius: calculate(INIT_ELEMENT_STYLES.slider.borderRadius),
      },
    }),
    [calculate]
  );

  const handleValueChange = (newValue: number | Array<number>) => {
    // @ts-ignore
    setValue(newValue);
  };

  const handleSlidingStart = () => {
    if (status !== 'moved') {
      setStatus('moving');
    }
  };

  const handleSlidingComplete = () => {
    setStatus('moved');
    startAnim();
    onSlide && onSlide(value);
  };

  const renderAboveThumbComponent = () => {
    const emojiSize = elementSizes.emoji.width;

    return (
      <View
        style={{
          width: emojiSize + emojiSize * (value / 100),
          height: emojiSize + emojiSize * (value / 100),
          left: -(emojiSize * (value / 100)) / 2,
          opacity: status === 'init' ? 0 : 1,
        }}
      >
        <Animated.View style={[{ position: 'absolute', ...animStyles }]}>
          <Emoji
            size={emojiSize + emojiSize * (value / 100)}
            emoji={params.emoji.unicode}
          />
        </Animated.View>
      </View>
    );
  };

  const renderThumbComponent = () => (
    <Emoji size={elementSizes.emoji.width} emoji={params.emoji.unicode} />
  );

  return (
    <View
      style={[
        styles.container,
        elementSizes.widget,
        { backgroundColor: stylesUtils.getThemeColor(params.color) },
      ]}
    >
      <Text
        style={[
          styles.title,
          elementSizes.text,
          { color: stylesUtils.getThemeContrastColor(params.color) },
        ]}
      >
        {params.text}
      </Text>
      <Slider
        value={value}
        minimumValue={0}
        maximumValue={100}
        onSlidingStart={handleSlidingStart}
        onValueChange={handleValueChange}
        onSlidingComplete={handleSlidingComplete}
        renderAboveThumbComponent={renderAboveThumbComponent}
        renderThumbComponent={renderThumbComponent}
        disabled={status === 'moved'}
        minimumTrackTintColor="#FF00D0"
        trackStyle={styles.track}
        thumbStyle={styles.thumb}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    paddingBottom: 30,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 15,
  },
  track: {
    width: '100%',
    height: 11,
    backgroundColor: 'hsla(0,0%,39.2%,.25)',
    borderRadius: 10,
  },
  thumb: {
    width: 30,
    height: 30,
    backgroundColor: 'transparent',
  },
});
