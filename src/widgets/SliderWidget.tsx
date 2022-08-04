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
import Reactions from '../core/Reactions';

interface Props {
  params: SliderWidgetParamsType;
  position: WidgetPositionType;
  positionLimits: WidgetPositionLimitsType;
  widgetId: string;
}

const INIT_ELEMENT_STYLES = {
  container: {
    borderRadius: 10,
    padding: 20,
  },
  emoji: {
    width: 30,
    height: 30,
  },
  text: {
    fontSize: 16,
    marginBottom: 15,
  },
  track: {
    height: 11,
    borderRadius: 6,
  },
  thumb: {
    width: 30,
    height: 30,
    borderRadius: 6,
  },
};

export const SliderWidget: React.FC<Props> = ({
  params,
  position,
  positionLimits,
  widgetId,
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
      container: {
        borderRadius: calculate(INIT_ELEMENT_STYLES.container.borderRadius),
        padding: calculate(INIT_ELEMENT_STYLES.container.padding),
      },
      emoji: {
        width: calculate(INIT_ELEMENT_STYLES.emoji.width),
      },
      text: {
        fontSize: calculate(INIT_ELEMENT_STYLES.text.fontSize),
        marginBottom: calculate(INIT_ELEMENT_STYLES.text.marginBottom),
      },
      track: {
        height: calculate(INIT_ELEMENT_STYLES.track.height),
        borderRadius: calculate(INIT_ELEMENT_STYLES.track.borderRadius),
      },
      thumb: {
        height: calculate(INIT_ELEMENT_STYLES.thumb.height),
        width: calculate(INIT_ELEMENT_STYLES.thumb.width),
      },
    }),
    [calculate]
  );

  const handleValueChange = (newValue: number | Array<number>) => {
    const val = newValue as number;

    setValue(val);
  };

  const handleSlidingStart = () => {
    if (status !== 'moved') {
      setStatus('moving');
    }
  };

  const handleSlidingComplete = () => {
    setStatus('moved');
    startAnim();

    Reactions.registerWidget(widgetId);
    Reactions.send('answer', value);
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
        elementSizes.container,
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
        trackStyle={{ ...styles.track, ...elementSizes.track }}
        thumbStyle={{ ...styles.thumb, ...elementSizes.thumb }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
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
    textAlign: 'center',
    fontWeight: '500',
  },
  track: {
    width: '100%',
    backgroundColor: 'hsla(0,0%,39.2%,.25)',
  },
  thumb: {
    backgroundColor: 'transparent',
  },
});
