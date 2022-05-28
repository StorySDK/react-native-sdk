import React from 'react';
import { StyleSheet, View, Pressable, Animated } from 'react-native';
import type {
  EmojiReactionWidgetParamsType,
  WidgetPositionLimitsType,
  WidgetPositionType,
} from '../types';
import Emoji from '../components/Emoji';
import { useSpiritAnim } from '../hooks';
import { stylesUtils } from '../utils';

interface Props {
  params: EmojiReactionWidgetParamsType;
  position: WidgetPositionType;
  positionLimits: WidgetPositionLimitsType;

  onReact?(): void;
}

interface EmojiButtonProps {
  name: string;
  unicode: string;

  onPress(): void;

  disabled?: boolean;
}

const EmojiButton: React.FC<EmojiButtonProps> = ({
  name,
  unicode,
  onPress,
  disabled,
}) => {
  const { animStyles, startAnim } = useSpiritAnim();

  const handlePress = () => {
    if (!disabled) {
      startAnim();
      onPress();
    }
  };

  return (
    <Pressable key={name} style={styles.item} onPress={handlePress}>
      <Animated.View style={{ position: 'absolute', ...animStyles }}>
        <Emoji size={32} emoji={unicode} />
      </Animated.View>
      <Emoji size={32} emoji={unicode} />
    </Pressable>
  );
};

export const EmojiReactionWidget: React.FC<Props> = ({ params }) => {
  const [selectedEmoji, setEmoji] = React.useState<string | null>(null);

  const handleSelectEmoji = (emojiName: string) => () => {
    setEmoji(emojiName);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: stylesUtils.getThemeColor(params.color) },
      ]}
    >
      {params.emoji.map(({ unicode, name }) => (
        <EmojiButton
          key={name}
          name={name}
          unicode={unicode}
          onPress={handleSelectEmoji(name)}
          disabled={!!selectedEmoji}
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
    borderRadius: 50,
    padding: 16,
    paddingLeft: 20,
    paddingRight: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  item: {
    marginRight: 12,
  },
});
