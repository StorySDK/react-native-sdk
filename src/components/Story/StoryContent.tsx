import React from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  Pressable,
  PixelRatio,
} from 'react-native';
import type { StoryType, WidgetObjectType } from '../../types';
import { WidgetFactory } from '../../core/WidgetFactory';
import Reactions from '../../core/Reactions';
import WidgetAnimation from '../../core/WidgetAnimation';
import StoryBackground from './StoryBackground';
import WidgetErrorBoundary from '../../core/WidgetErrorBoundary';
import { WidgetsTypes } from '../../types';
import StoryContext from '../../core/StoryContext';

interface StoryContentProps {
  story: StoryType;
  onNext(): void;

  onPrev(): void;
  onTouchStart(): void;
  onTouchEnd(): void;
}

const StoryContent: React.FC<StoryContentProps> = (props) => {
  const { story, onNext, onPrev, onTouchEnd, onTouchStart } = props;
  const storyContext = React.useContext(StoryContext);

  const renderWidget = (widget: WidgetObjectType) => (
    <WidgetAnimation
      widget={widget}
      play={widget.id === storyContext.foregroundWidget}
    >
      <WidgetErrorBoundary>
        <WidgetFactory widget={widget} storyId={story.id} />
      </WidgetErrorBoundary>
    </WidgetAnimation>
  );

  React.useEffect(() => {
    Reactions.registerStory(story.id);
  }, [story.id]);

  const scale = parseFloat((Dimensions.get('window').width / 390).toFixed(3));
  const translateX = Math.round(Dimensions.get('window').width - 390) / 2;
  const translateY =
    (Math.round(Dimensions.get('window').width - 390) / 2) * 1.778;

  const interactiveWidgetTypes: WidgetsTypes[] = [
    WidgetsTypes.SWIPE_UP,
    WidgetsTypes.SLIDER,
    WidgetsTypes.QUESTION,
    WidgetsTypes.CLICK_ME,
    WidgetsTypes.TALK_ABOUT,
    WidgetsTypes.EMOJI_REACTION,
    WidgetsTypes.TIMER,
    WidgetsTypes.CHOOSE_ANSWER,
  ];

  const interactiveWidgets = story.storyData.filter((w) =>
    interactiveWidgetTypes.includes(w.content.type)
  );

  const notInteractiveWidgets = story.storyData.filter(
    (w) => !interactiveWidgetTypes.includes(w.content.type)
  );

  return (
    <View
      style={[
        styles.container,
        {
          transform: [{ scale }, { translateX }, { translateY }],
        },
      ]}
    >
      <StoryBackground background={story.background} />
      {notInteractiveWidgets.map(renderWidget)}
      <Pressable
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onPress={onPrev}
        style={styles.previewHandler}
      />
      <Pressable
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onPress={onNext}
        style={styles.nextHandler}
      />
      {interactiveWidgets.map(renderWidget)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 1080 / PixelRatio.get(),
    height: 1920 / PixelRatio.get(),
    backgroundColor: 'white',
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

// export default React.memo(StoryContent);
export default StoryContent;
