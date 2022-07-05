import React from 'react';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import {
  View,
  Dimensions,
  StyleSheet,
  Pressable,
  PixelRatio,
} from 'react-native';
import type { StoryType } from '../types';
import { stylesUtils } from '../utils';
import { WidgetFactory } from '../core/WidgetFactory';
import Reactions from '../core/Reactions';
import WidgetAnimation from '../core/WidgetAnimation';

interface StoryContentProps {
  story: StoryType;
  foregroundWidget: null | string;
  onNext(): void;

  onPrev(): void;
}

export const StoryContent: React.FC<StoryContentProps> = (props) => {
  const { story, onNext, onPrev, foregroundWidget } = props;
  const video = React.useRef<Video>(null);

  console.log(PixelRatio.get());

  React.useEffect(() => {
    Reactions.registerStory(story.id);
  }, [story.id]);

  React.useEffect(() => {
    if (story.background.type === 'video' && video && video.current) {
    }
  }, [story.background.type]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: stylesUtils.renderBackground(story.background),
          transform: [
            {
              scale: parseFloat(
                (Dimensions.get('window').width / 390).toFixed(3)
              ),
            },
            {
              translateX: Math.round(Dimensions.get('window').width - 390) / 2,
            },
            {
              translateY:
                (Math.round(Dimensions.get('window').width - 390) / 2) * 1.778,
            },
          ],
        },
      ]}
    >
      {story.background.type === 'gradient' && (
        <LinearGradient style={styles.video} colors={story.background.value} />
      )}
      {story.background.type === 'video' && (
        <Video
          ref={video}
          style={styles.video}
          source={{
            uri: story.background.value,
          }}
          resizeMode="cover"
          paused={false}
        />
      )}
      <Pressable onPress={onPrev} style={styles.previewHandler} />
      <Pressable onPress={onNext} style={styles.nextHandler} />
      {story.storyData.map((widget) => (
        <WidgetAnimation widget={widget} play={widget.id === foregroundWidget}>
          <WidgetFactory widget={widget} storyId={story.id} />
        </WidgetAnimation>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 1080 / PixelRatio.get(),
    height: 1920 / PixelRatio.get(),
    overflow: 'hidden',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignSelf: 'center',
    width: 1080 / PixelRatio.get(),
    height: 1920 / PixelRatio.get(),
    overflow: 'hidden',
  },
  previewHandler: {
    position: 'absolute',
    left: 0,
    top: 60,
    width: '50%',
    height: Dimensions.get('window').height - 80,
  },
  nextHandler: {
    position: 'absolute',
    right: 0,
    top: 60,
    width: '50%',
    height: Dimensions.get('window').height - 80,
  },
  widget: {
    position: 'absolute',
  },
});

export default StoryContent;
