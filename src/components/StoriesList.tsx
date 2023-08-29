import React from 'react';
import { StyleSheet, View, Text, Dimensions, StatusBar } from 'react-native';
import { ScoreType, type GroupType, type StoryType } from '../types';
import Story from './Story';
import StatusBarContext from '../core/StatusBarContext';
import { useAsyncStorage } from '../hooks/useAsyncStorage';

interface StoryModalProps {
  group: GroupType;
  showed: boolean;
  isCurrentGroup: boolean;
  onClose(): void;
  onPreviewGroup(): void;
  onNextGroup(): void;
}

const initQuizeState = {
  points: 0,
  letters: '',
};

const reducer = (state: any, action: any) => {
  if (action.type === 'add_points') {
    return {
      points: state.points + +action.payload,
      letters: state.letters,
    };
  }
  if (action.type === 'add_letters') {
    return {
      points: state.points,
      letters: state.letters + action.payload,
    };
  }
  if (action.type === 'remove_points') {
    return {
      points: state.points - +action.payload,
      letters: state.letters,
    };
  }
  if (action.type === 'remove_letters') {
    return {
      points: state.points,
      letters: state.letters.replace(action.payload, ''),
    };
  }

  if (action.type === 'restore') {
    return action.payload;
  }

  if (action.type === 'reset') {
    return initQuizeState;
  }
  throw Error('Unknown action.');
};

export const QuizContenxt = React.createContext({
  state: initQuizeState,
  mode: ScoreType.LETTERS,
  onQuizAnswer(params: { type: string; answer: string | number }) {
    console.log(params);
  },
});

export const StoriesList: React.FC<StoryModalProps> = (props) => {
  const {
    group,
    showed,
    isCurrentGroup,
    onClose,
    onNextGroup,
    onPreviewGroup,
  } = props;

  const [currentStory, setCurrentStory] = React.useState(0);

  const [storedQuizState, setStoredQuizState] = useAsyncStorage(
    `StorySDK.quizstate-${group.id}`,
    initQuizeState
  );

  const [quizState, dispatchQuizState] = React.useReducer(
    reducer,
    initQuizeState
  );

  const [isQuizStarted, setIsQuizStarted] = React.useState(false);
  const [quizStartedStoryIds, setQuizStartedStoryIds] = React.useState<{
    [key: string]: boolean;
  }>({});

  React.useEffect(() => {
    if (showed) {
      dispatchQuizState({
        type: 'restore',
        payload: storedQuizState,
      });
    }
  }, [storedQuizState, showed]);

  const handleQuizAnswer = (params: {
    type: string;
    answer: string | number;
  }) => {
    if (params.type === 'add' && !isQuizStarted) {
      // onStartQuiz && onStartQuiz(group.id);
      setIsQuizStarted(true);
    }

    if (
      params.type === 'add' &&
      !quizStartedStoryIds[group.stories[currentStory].id]
    ) {
      // onStartQuiz && onStartQuiz(group.id, group.stories[currentStory].id);
      setQuizStartedStoryIds((prevState) => ({
        ...prevState,
        [group.stories[currentStory].id]: true,
      }));
    }

    if (
      group.settings?.scoreType === ScoreType.LETTERS &&
      params.type === 'add'
    ) {
      dispatchQuizState({
        type: 'add_letters',
        payload: params.answer,
      });
    } else if (
      group.settings?.scoreType === ScoreType.NUMBERS &&
      params.type === 'add'
    ) {
      dispatchQuizState({
        type: 'add_points',
        payload: +params.answer,
      });
    } else if (
      group.settings?.scoreType === ScoreType.LETTERS &&
      params.type === 'remove'
    ) {
      dispatchQuizState({
        type: 'remove_letters',
        payload: params.answer,
      });
    } else if (
      group.settings?.scoreType === ScoreType.NUMBERS &&
      params.type === 'remove'
    ) {
      dispatchQuizState({
        type: 'remove_points',
        payload: +params.answer,
      });
    }
  };

  const [activeStoriesWithResult, setActiveStoriesWithResult] = React.useState<
    StoryType[]
  >([]);
  React.useEffect(() => {
    setActiveStoriesWithResult(
      group.stories
        .filter((story) => {
          if (
            story.layerData?.layersGroupId ===
            group.settings?.scoreResultLayersGroupId
          ) {
            return true;
          }

          return story.layerData?.isDefaultLayer;
        })
        .sort((storyA, storyB) => {
          if (
            storyA.layerData?.layersGroupId ===
            group.settings?.scoreResultLayersGroupId
          ) {
            return 1;
          }
          if (
            storyB.layerData?.layersGroupId ===
            group.settings?.scoreResultLayersGroupId
          ) {
            return -1;
          }
          return 0;
        })
    );
  }, [group.settings?.scoreResultLayersGroupId, group.stories]);

  const resultStories = React.useMemo(() => {
    if (group.settings?.scoreResultLayersGroupId) {
      return group.stories
        .filter(
          (story) =>
            story.layerData?.layersGroupId ===
            group.settings?.scoreResultLayersGroupId
        )
        .map((story) => ({
          id: story.id,
          isDefaultLayer: story.layerData?.isDefaultLayer,
          score: story.layerData.score,
        }));
    }

    return [];
  }, [group.settings?.scoreResultLayersGroupId, group.stories]);

  const getResultStoryId = React.useCallback(() => {
    if (!resultStories.length || !group.settings?.scoreResultLayersGroupId) {
      return '';
    }

    const nextLayersGroupId =
      activeStoriesWithResult[currentStory + 1]?.layerData.layersGroupId;
    const prevLayersGroupId =
      activeStoriesWithResult[currentStory - 1]?.layerData.layersGroupId;
    let resultStoryId = '';

    if (
      (nextLayersGroupId &&
        nextLayersGroupId === group.settings?.scoreResultLayersGroupId) ||
      (prevLayersGroupId &&
        prevLayersGroupId === group.settings?.scoreResultLayersGroupId)
    ) {
      resultStoryId =
        resultStories.find((story) => story.isDefaultLayer)?.id ?? '';

      if (
        group.settings?.scoreType === ScoreType.NUMBERS &&
        quizState.points > 0
      ) {
        for (let i = 0; i < resultStories.length; i++) {
          if (+resultStories[i].score.points <= quizState.points) {
            resultStoryId = resultStories[i].id;
          }
        }
      } else if (
        group.settings?.scoreType === ScoreType.LETTERS &&
        quizState.letters
      ) {
        const lettersArr = quizState.letters.toLowerCase().split('');

        let mostFrequentSymbol = '';
        let maxCount = 0;
        const letterCounts: any = {};

        for (let i = 0; i < lettersArr.length; i++) {
          const letter = lettersArr[i];
          if (!letterCounts[letter]) {
            letterCounts[letter] = 1;
          } else {
            letterCounts[letter]++;
          }
          if (letterCounts[letter] > maxCount) {
            maxCount = letterCounts[letter];
            mostFrequentSymbol = letter;
          }
        }

        resultStoryId =
          resultStories.find(
            (story) => story.score.letter.toLowerCase() === mostFrequentSymbol
          )?.id ?? '';
      }
    }

    return resultStoryId;
  }, [
    resultStories,
    activeStoriesWithResult,
    group.settings?.scoreResultLayersGroupId,
    group.settings?.scoreType,
    currentStory,
    quizState,
    storedQuizState,
  ]);

  const handleFinishStoryQuiz = () => {
    if (showed && isCurrentGroup) {
      setStoredQuizState(quizState);
    }
  };

  const statusBar = React.useContext(StatusBarContext);
  React.useEffect(() => {
    if (
      !activeStoriesWithResult ||
      activeStoriesWithResult.length - 1 < currentStory
    )
      return;

    // const storyBackground = activeStoriesWithResult[currentStory].background;

    // if (storyBackground.type === 'color') {
    //   statusBar.setBackgroundColor(storyBackground.value as string)
    //   return
    // }

    // if (storyBackground.type === 'gradient') {
    //   // console.log(stylesUtils.blendColors(storyBackground.value[0], storyBackground.value[1], 0.5))
    //   statusBar.setBackgroundColor(
    //     storyBackground.value[0]
    //   )
    //   return
    // }

    // statusBar.setBackgroundColor('#000')
  }, [currentStory, showed, activeStoriesWithResult, isCurrentGroup]);

  const handleClose = () => {
    handleFinishStoryQuiz();
    onClose();
  };

  const handleNext = () => {
    if (currentStory === group.stories.length - 1) {
      onNextGroup();
    } else {
      setCurrentStory(currentStory + 1);
    }

    const resultStoryId = getResultStoryId();

    if (
      currentStory === activeStoriesWithResult.length - 1 ||
      activeStoriesWithResult[currentStory].id === resultStoryId
    ) {
      handleFinishStoryQuiz();
      onNextGroup();
    } else {
      if (resultStoryId) {
        const resultStoryIndex = activeStoriesWithResult.findIndex(
          (story) => story.id === resultStoryId
        );

        setCurrentStory(resultStoryIndex);
      } else {
        setCurrentStory(currentStory + 1);
      }
    }
  };

  const handlePreview = () => {
    if (currentStory === 0) {
      handleFinishStoryQuiz();
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
    <QuizContenxt.Provider
      value={{
        state: quizState,
        onQuizAnswer: handleQuizAnswer,
        mode: group.settings?.scoreType || ScoreType.LETTERS,
      }}
    >
      <View style={styles.container}>
        {showed && (
          <StatusBar
            backgroundColor={statusBar.backgroundColor}
            barStyle="light-content"
          />
        )}
        {activeStoriesWithResult.length === 0 && (
          <FallbackText>No story</FallbackText>
        )}
        {activeStoriesWithResult
          .filter((_story, index) => index === currentStory)
          .map((story) => (
            <Story
              key={story.id}
              story={story}
              group={group}
              stories={activeStoriesWithResult.filter(
                (story) => story.layerData?.isDefaultLayer
              )}
              isCurrentGroup={isCurrentGroup}
              currentStory={currentStory}
              onNext={handleNext}
              onPrev={handlePreview}
              onClose={handleClose}
            />
          ))}
      </View>
    </QuizContenxt.Provider>
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
