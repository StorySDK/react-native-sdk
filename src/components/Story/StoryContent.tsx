import React from 'react';
import { View, StyleSheet, Pressable, PixelRatio } from 'react-native';
import type { StoryType, WidgetObjectType } from '../../types';
import { WidgetFactory } from './WidgetFactory';
import Reactions from '../../core/Reactions';
import WidgetAnimation from './WidgetAnimation';
import StoryBackground from './StoryBackground';
import WidgetErrorBoundary from './WidgetErrorBoundary';
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
    <View style={[styles.container]}>
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
    height: 1860 / PixelRatio.get(),
  },
  nextHandler: {
    position: 'absolute',
    right: 0,
    top: 60,
    width: '50%',
    height: 1860 / PixelRatio.get(),
  },
  widget: {
    position: 'absolute',
  },
});

export default StoryContent;
