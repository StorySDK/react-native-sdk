import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Animated,
  Text,
  Dimensions,
  Pressable,
  StatusBar,
} from 'react-native';
import type { GroupType, StoryType } from '../types';
import { StoryContent } from './StoryContent';
import { CloseIcon } from '../icons';

interface StoryModalProps {
  stories: StoryType[];
  group: GroupType;
  showed: boolean;
  isLastGroup: boolean;
  isFirstGroup: boolean;

  onClose(): void;

  onPreviewGroup(): void;

  onNextGroup(): void;
}

const AnimatedIndicator: React.FC<{
  onEnd(): void;
  groupId: string;
  paused: boolean;
}> = (props) => {
  const anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    anim.setValue(0);
  }, [anim, props.groupId]);

  React.useEffect(() => {
    Animated.timing(anim, {
      useNativeDriver: false,
      toValue: 100,
      duration: 7000,
    }).start(props.onEnd);
  }, [anim, props.onEnd]);

  return (
    <Animated.View
      style={{
        borderRadius: 4,
        height: 4,
        width: anim.interpolate({
          inputRange: [0, 100],
          outputRange: ['0%', '100%'],
        }),
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
      }}
    />
  );
};

export const StoryModal: React.FC<StoryModalProps> = (props) => {
  const {
    stories,
    group,
    showed,
    isLastGroup,
    isFirstGroup,
    onClose,
    onNextGroup,
    onPreviewGroup,
  } = props;

  const [currentStory, setCurrentStory] = React.useState(0);
  const [paused] = React.useState(false);

  React.useEffect(() => {
    setCurrentStory(0);
  }, [group.id]);

  const MemoAnimatedIndicator = React.memo(AnimatedIndicator);

  const handleClose = () => {
    onClose();
  };

  const handleAnimationEnd = () => {
    // handleNext();
  };

  const handleNext = () => {
    if (currentStory === stories.length - 1) {
      isLastGroup ? handleClose() : onNextGroup();
    } else {
      setCurrentStory(currentStory + 1);
    }
  };

  const handlePreview = () => {
    if (currentStory === 0) {
      isFirstGroup ? handleClose() : onPreviewGroup();
    } else {
      setCurrentStory(currentStory - 1);
    }
  };

  const handleTouchStart = () => {};

  const handleTouchEnd = () => {};

  return (
    <View
      style={styles.container}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {showed && <StatusBar backgroundColor="#000" barStyle="light-content" />}
      <View style={styles.content}>
        {stories
          .filter((_story, index) => index === currentStory)
          .map((story) => (
            <StoryContent
              key={story.id}
              story={story}
              onNext={handleNext}
              onPrev={handlePreview}
            />
          ))}
      </View>
      {/*{showed && <StatusBar style="dark" />}*/}
      <Pressable style={[styles.closeBtn]} onPress={handleClose}>
        <CloseIcon />
      </Pressable>
      <View style={[styles.group]}>
        <Image style={styles.groupImg} source={{ uri: group.imageUrl }} />
        <Text style={styles.groupTitle}>{group.title}</Text>
        <Text style={styles.groupDate}>3h</Text>
      </View>
      <View style={styles.indicatorContainer}>
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
              <MemoAnimatedIndicator
                onEnd={handleAnimationEnd}
                groupId={group.id}
                paused={paused}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  closeBtn: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    right: 12,
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
    fontWeight: '600',
    fontSize: 14,
    marginRight: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
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
    height: 4,
    marginRight: 2,
  },
});

export default StoryModal;
