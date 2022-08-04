import React from 'react';
import { PixelRatio, StyleSheet, View } from 'react-native';
import type { GroupType, StoryType, PlayStatusType } from '../../types';
import StoryContent from './StoryContent';
import StoryControls from './StoryControls';
import StoryContext from '../../core/StoryContext';

interface Props {
  story: StoryType;
  group: GroupType;
  currentStory: number;
  isCurrentGroup: boolean;
  onClose(): void;
  onNext(): void;
  onPrev(): void;
}

const Story: React.FC<Props> = (props) => {
  const {
    story,
    group,
    currentStory,
    isCurrentGroup,
    onClose,
    onNext,
    onPrev,
  } = props;

  let pressTimout: any = null;

  const [playStatus, setPlayStatus] = React.useState<PlayStatusType>('wait');
  const [foregroundWidget, setForegroundWidget] = React.useState<null | string>(
    null
  );

  React.useEffect(() => {
    setForegroundWidget(null);
    if (isCurrentGroup) {
      setPlayStatus('play');
    }
  }, [isCurrentGroup]);

  React.useEffect(() => {
    if (foregroundWidget) {
      setPlayStatus('pause');
    }
  }, [foregroundWidget]);

  const handleTouchStart = () => {
    pressTimout = setTimeout(() => {
      setPlayStatus('pause');
    }, 400);
  };

  const handleTouchEnd = () => {
    clearTimeout(pressTimout);
    setPlayStatus('play');
  };

  const handleNext = () => {
    if (playStatus !== 'pause') {
      onNext();
    }
  };

  const handlePrev = () => {
    if (playStatus !== 'pause') {
      onPrev();
    }
  };

  return (
    <StoryContext.Provider
      value={{
        playStatusChange: setPlayStatus,
        setForegroundWidget,
        playStatus,
        foregroundWidget,
      }}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <StoryContent
            key={story.id}
            story={story}
            onNext={handleNext}
            onPrev={handlePrev}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />
        </View>
        <View style={styles.controls}>
          <StoryControls
            currentStory={currentStory}
            group={group}
            onClose={onClose}
            onNext={handleNext}
          />
        </View>
      </View>
    </StoryContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 1080 / PixelRatio.get(),
    height: 1920 / PixelRatio.get(),
  },
  content: {},
  controls: {
    flex: 1,
    position: 'absolute',
    top: 0,
  },
});

export default Story;
