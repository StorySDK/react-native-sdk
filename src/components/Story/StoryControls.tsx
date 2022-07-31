import React from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { GroupType } from '../../types';
import { CloseIcon } from '../../icons';
import StoryContext from '../../core/StoryContext';
import AnimatedIndicator from './AnimatedIndicator';

interface Props {
  group: GroupType;
  currentStory: number;
  onClose(): void;
  onNext(): void;
}

const StoryControls: React.FC<Props> = (props) => {
  const { group, currentStory, onClose, onNext } = props;
  const storyContext = React.useContext(StoryContext);

  const hide = {
    opacity: storyContext.foregroundWidget ? 0 : 1,
  };

  return (
    <Animated.View style={[styles.container, hide]}>
      <Pressable style={[styles.closeBtn]} onPress={onClose}>
        <CloseIcon />
      </Pressable>
      <View style={[styles.group]}>
        <Image style={styles.groupImg} source={{ uri: group.imageUrl }} />
        <Text style={styles.groupTitle}>{group.title}</Text>
      </View>
      <View style={[styles.indicatorContainer]}>
        {group.stories.map((_story, index) => (
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

const styles = StyleSheet.create({
  container: {},
  closeBtn: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    left: Dimensions.get('window').width - 40,
    top: 18,
    height: 32,
    width: 32,
  },
  item: {
    width: '100px',
  },
  group: {
    position: 'absolute',
    left: 12,
    top: 18,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 8,
    textShadowColor: 'rgba(24, 24, 24, 0.46)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  groupImg: {
    width: 32,
    height: 32,
    borderRadius: 50,
    marginRight: 12,
  },
  groupDate: {
    fontSize: 14,
    color: 'white',
    opacity: 0.5,
  },
  indicatorContainer: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'row',
    top: 8,
    width: Dimensions.get('window').width - 24,
    marginLeft: 12,
    marginRight: 10,
    height: 4,
  },
  indicator: {
    position: 'relative',
    flex: 1,
    borderRadius: 4,
    height: 2,
    marginRight: 2,
  },
});

export default StoryControls;
