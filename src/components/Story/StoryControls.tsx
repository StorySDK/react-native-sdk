import React from 'react';
import {
  Animated,
  Image,
  PixelRatio,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { GroupType, StoryType } from '../../types';
import { CloseIcon } from '../../icons';
import StoryContext from '../../core/StoryContext';
import AnimatedIndicator from './AnimatedIndicator';
import { stylesUtils } from '../../utils';

interface Props {
  group: GroupType;
  stories: StoryType[];
  currentStory: number;
  onClose(): void;
  onNext(): void;
}

const StoryControls: React.FC<Props> = (props) => {
  const { group, stories, currentStory, onClose, onNext } = props;
  const storyContext = React.useContext(StoryContext);

  const hide = {
    opacity: storyContext.foregroundWidget ? 0 : 1,
  };

  return (
    <Animated.View style={[styles.container, hide]}>
      <Pressable style={[styles.closeBtn]} onPress={onClose}>
        <CloseIcon width={size(16)} height={size(16)} />
      </Pressable>
      <View style={[styles.group]}>
        <Image style={styles.groupImg} source={{ uri: group.imageUrl }} />
        <Text style={styles.groupTitle}>{group.title}</Text>
      </View>
      <View style={[styles.indicatorContainer]}>
        {stories.map((_story, index) => (
          <View
            key={_story.id}
            style={[
              styles.indicator,
              {
                backgroundColor:
                  index < currentStory
                    ? 'rgba(255, 255, 255, 0.7)'
                    : 'rgba(255, 255, 255, 0.3)',
              },
            ]}
          >
            {index === currentStory && (
              <AnimatedIndicator
                onNext={onNext}
                playStatus={storyContext.playStatus}
              />
            )}
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const size = stylesUtils.calculateScale;

const styles = StyleSheet.create({
  container: {},
  closeBtn: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    left: 1080 / PixelRatio.get() - size(40),
    top: size(18),
    height: size(32),
    width: size(32),
  },
  group: {
    position: 'absolute',
    left: size(12),
    top: size(18),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: size(14),
    marginRight: size(8),
    textShadowColor: 'rgba(24, 24, 24, 0.46)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: size(10),
  },
  groupImg: {
    width: size(32),
    height: size(32),
    borderRadius: size(50),
    marginRight: size(12),
  },
  indicatorContainer: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'row',
    top: size(8),
    width: 1080 / PixelRatio.get() - size(24),
    marginLeft: size(12),
    marginRight: size(10),
    height: size(4),
  },
  indicator: {
    position: 'relative',
    flex: 1,
    borderRadius: size(4),
    height: size(2),
    marginRight: size(2),
  },
});

export default StoryControls;
