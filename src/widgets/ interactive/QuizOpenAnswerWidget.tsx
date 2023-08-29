import React from 'react';
import { StyleSheet, Pressable, Text, TextInput } from 'react-native';
import type { WidgetPositionLimitsType, WidgetPositionType } from '../../types';
import type {
  QuizOpenAnswerWidgetParamsType,
  QuizOpenAnswerWidgetElementsType,
} from 'src/types';
import StoryContext from '../../core/StoryContext';
import { useAnswersCache } from '../../hooks/useAnswerCache';

interface Props {
  params: QuizOpenAnswerWidgetParamsType;
  elementsSize?: QuizOpenAnswerWidgetElementsType;
  position: WidgetPositionType;
  positionLimits: WidgetPositionLimitsType;
  widgetId: string;
}

// const INIT_ELEMENT_STYLES = {
//   title: {
//     fontSize: 14,
//     marginBottom: 16,
//   },
//   input: {
//     fontSize: 11,
//     paddingVertical: 9,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     paddingRight: 35,
//   },
//   sendButton: {
//     width: 25,
//     height: 25,
//     right: 4,
//   },
// };

const useScalableSizes = (props: Props) => {
  const { elementsSize } = props;

  return {
    title: {
      fontSize: elementsSize?.title.fontSize,
      marginBottom: elementsSize?.title.marginBottom,
    },
    input: {
      fontSize: elementsSize?.input.fontSize,
      paddingVertical: elementsSize?.inputWrapper.paddingVertical,
      paddingHorizontal: elementsSize?.inputWrapper.paddingHorizontal,
      borderRadius: elementsSize?.inputWrapper.borderRadius,
      paddingRight: elementsSize?.inputWrapper.paddingRight,
    },
    sendButton: {
      width: elementsSize?.sendButton.width,
      height: elementsSize?.sendButton.height,
      right: elementsSize?.sendButton.right,
    },
  };
};

export const QuizOpenAnswerWidget: React.FC<Props> = (props) => {
  const { params, widgetId } = props;

  const sizes = useScalableSizes(props);
  const storyContextVal = React.useContext(StoryContext);

  const [selectedAnswer, setAnswer] = useAnswersCache<string>(widgetId);

  const [text, setText] = React.useState(selectedAnswer || '');
  const ref = React.useRef<any>(null);

  const handlePress = () => {
    if (ref) {
      ref.current.focus();
    }
  };

  const handleFocus = () => {
    storyContextVal.playStatusChange('pause');
    storyContextVal.setForegroundWidget(widgetId);
  };

  const handleBlur = React.useCallback(() => {
    setAnswer(text);

    storyContextVal.playStatusChange('play');
    storyContextVal.setForegroundWidget(null);
  }, [text]);

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      {!params.isTitleHidden && (
        <Text style={[styles.title, sizes.title]}>{params.title}</Text>
      )}
      <TextInput
        ref={ref}
        style={[styles.field, sizes.input]}
        value={selectedAnswer || text}
        placeholder="Enter text..."
        onChangeText={setText}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {},
  title: {
    textAlign: 'center',
    color: 'white',
  },
  field: {
    backgroundColor: '#FFFFFF26',
  },
});
