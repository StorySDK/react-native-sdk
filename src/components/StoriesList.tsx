import React from 'react';
import { StyleSheet, View, Text, Dimensions, StatusBar } from 'react-native';
import type { GroupType } from '../types';
import Story from './Story';

interface StoryModalProps {
  group: GroupType;
  showed: boolean;
  isCurrentGroup: boolean;
  onClose(): void;
  onPreviewGroup(): void;
  onNextGroup(): void;
}

export const StoriesList: React.FC<StoryModalProps> = (props) => {
  const {
    group,
    showed,
    isCurrentGroup,
    onClose,
    onNextGroup,
    onPreviewGroup,
  } = props;
  console.log('isCurrentGroup', isCurrentGroup);
  const [currentStory, setCurrentStory] = React.useState(0);

  const handleClose = () => {
    onClose();
  };

  const handleNext = () => {
    if (currentStory === group.stories.length - 1) {
      onNextGroup();
    } else {
      setCurrentStory(currentStory + 1);
    }
  };

  const handlePreview = () => {
    if (currentStory === 0) {
      onPreviewGroup();
    } else {
      setCurrentStory(currentStory - 1);
    }
  };

  const FallbackText: React.FC = ({ children }) => (
    <View style={styles.fallbackContent}>
      <Text style={styles.fallbackText}>{children}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {showed && <StatusBar backgroundColor="#000" barStyle="light-content" />}
      {group.stories.length === 0 && <FallbackText>No story</FallbackText>}
      {group.stories
        .filter((_story, index) => index === currentStory)
        .map((story) => (
          <Story
            key={story.id}
            story={story}
            group={group}
            isCurrentGroup={isCurrentGroup}
            currentStory={currentStory}
            onNext={handleNext}
            onPrev={handlePreview}
            onClose={handleClose}
          />
        ))}
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
  fallbackContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#9a9a9a',
    fontSize: 16,
  },
});

export default StoriesList;
