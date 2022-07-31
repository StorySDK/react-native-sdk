import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';
import { PixelRatio, StyleSheet, View, Image } from 'react-native';
import type { BackgroundType } from '../../types';
import { stylesUtils } from '../../utils';

interface StoryBackgroundProps {
  background: BackgroundType;
}

const StoryBackground: React.FC<StoryBackgroundProps> = (props) => {
  const { background } = props;

  if (background.type === 'gradient') {
    return <LinearGradient style={styles.video} colors={background.value} />;
  }

  if (background.type === 'video') {
    return (
      <Video
        style={styles.video}
        source={{
          uri: background.value,
        }}
        resizeMode="cover"
        paused={false}
      />
    );
  }

  if (background.type === 'image') {
    return <Image style={styles.video} source={{ uri: background.value }} />;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: stylesUtils.renderBackground(background) },
      ]}
    />
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
});

export default StoryBackground;
