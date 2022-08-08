import React from 'react';
import { StyleSheet, View, Pressable, Animated } from 'react-native';
import type {
  EmojiReactionWidgetParamsType,
  WidgetPositionLimitsType,
  WidgetPositionType,
} from '../../types';
import Emoji from '../../components/Emoji';
import { useSpiritAnim } from '../../hooks';
import { stylesUtils } from '../../utils';
import Reactions from '../../core/Reactions';

interface Props {
  params: EmojiReactionWidgetParamsType;
  position: WidgetPositionType;
  positionLimits: WidgetPositionLimitsType;
  widgetId: string;
}

interface EmojiButtonProps {
  name: string;
  unicode: string;

  onPress(): void;

  disabled?: boolean;
  style: any;
  size: number;
}

const INIT_ELEMENT_STYLES = {
  widget: {
    borderRadius: 50,
    paddingTop: 14,
    paddingBottom: 14,
    paddingRight: 11,
    paddingLeft: 11,
  },
  emoji: {
    width: 34,
  },
  item: {
    marginRight: 11,
    marginLeft: 11,
  },
};

const EmojiButton: React.FC<EmojiButtonProps> = ({
  name,
  unicode,
  onPress,
  disabled,
  style,
  size,
}) => {
  const { animStyles, startAnim } = useSpiritAnim();

  const handlePress = () => {
    if (!disabled) {
      startAnim();
      onPress();
    }
  };

  return (
    <Pressable key={name} style={[styles.item, style]} onPress={handlePress}>
      <Animated.View style={{ position: 'absolute', ...animStyles }}>
        <Emoji size={size} emoji={unicode} />
      </Animated.View>
      <Emoji size={size} emoji={unicode} />
    </Pressable>
  );
};

export const EmojiReactionWidget: React.FC<Props> = ({
  params,
  widgetId,
  position,
  positionLimits,
}) => {
  const [selectedEmoji, setEmoji] = React.useState<string | null>(null);

  const handleSelectEmoji = (emojiName: string) => () => {
    setEmoji(emojiName);
    Reactions.registerWidget(widgetId);
    Reactions.send('answer', emojiName);
  };

  const calculate = React.useCallback(
    (size) => {
      if (position && positionLimits) {
        return stylesUtils.calculateElementSizeByHeight(
          position,
          positionLimits,
          size
        );
      }

      return size;
    },
    [position, positionLimits]
  );

  const elementSizes = React.useMemo(
    () => ({
      widget: {
        borderRadius: calculate(INIT_ELEMENT_STYLES.widget.borderRadius),
        paddingTop: calculate(INIT_ELEMENT_STYLES.widget.paddingTop),
        paddingBottom: calculate(INIT_ELEMENT_STYLES.widget.paddingBottom),
        paddingRight: calculate(INIT_ELEMENT_STYLES.widget.paddingRight),
        paddingLeft: calculate(INIT_ELEMENT_STYLES.widget.paddingLeft),
      },
      emoji: {
        width: calculate(INIT_ELEMENT_STYLES.emoji.width),
      },
      item: {
        marginRight: calculate(INIT_ELEMENT_STYLES.item.marginRight),
        marginLeft: calculate(INIT_ELEMENT_STYLES.item.marginLeft),
      },
    }),
    [calculate]
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: stylesUtils.getThemeColor(params.color) },
        elementSizes.widget,
      ]}
    >
      {params.emoji.map(({ unicode, name }) => (
        <EmojiButton
          key={name}
          name={name}
          unicode={unicode}
          onPress={handleSelectEmoji(name)}
          disabled={!!selectedEmoji}
          size={calculate(INIT_ELEMENT_STYLES.emoji.width)}
          style={elementSizes.item}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  item: {},
});
