import React from 'react';
import Video from 'react-native-video';
import { View, Dimensions, StyleSheet, Pressable } from 'react-native';
import type { StoryType } from '../types';
import { stylesUtils } from '../utils';
import { WidgetFactory } from '../core/WidgetFactory';

interface StoryContentProps {
  story: StoryType;

  onNext(): void;

  onPrev(): void;
}

export const StoryContent: React.FC<StoryContentProps> = props => {
  const { story, onNext, onPrev } = props;
  const video = React.useRef<Video>(null);

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
                (Dimensions.get('window').width / 390).toFixed(3),
              ),
            },
            { translateX: Math.round(Dimensions.get('window').width - 390) / 2 },
            {
              translateY:
                (Math.round(Dimensions.get('window').width - 390) / 2) * 1.778,
            },
          ],
        },
      ]}
    >
      {story.background.type === 'video' && (
        <Video
          ref={video}
          style={styles.video}
          source={{
            uri: story.background.value,
          }}
          resizeMode='cover'
          paused={false}
        />
      )}
      <Pressable onPress={onPrev} style={styles.previewHandler} />
      <Pressable onPress={onNext} style={styles.nextHandler} />
      {story.storyData.map(widget => (
        <View
          key={widget.id}
          style={[
            styles.widget,
            {
              left: widget.position.x,
              top: widget.position.y,
              width: widget.position.realWidth,
              height: widget.position.realHeight,
              transform: [
                {
                  rotate: `${widget.position.rotate}deg`,
                },
              ],
            },
          ]}
        >
          <WidgetFactory widget={widget} storyId={story.id} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 390,
    height: 694,
    borderRadius: 8,
    overflow: 'hidden',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignSelf: 'center',
    width: 390,
    height: 694,
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
