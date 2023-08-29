import React from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import Emoji from '../../components/Emoji';
import {
  type QuizOneAnswerWidgetParamsType,
  type QuizOneAnswerWidgetElementsType,
  type WidgetPositionType,
  type WidgetPositionLimitsType,
  ScoreType,
} from '../../types';
import { stylesUtils } from '../../utils';
import { QuizContenxt } from '../../components/StoriesList';
import { useAnswersCache } from '../../hooks/useAnswerCache';

interface Props {
  params: QuizOneAnswerWidgetParamsType;
  elementsSize?: QuizOneAnswerWidgetElementsType;
  position: WidgetPositionType;
  positionLimits: WidgetPositionLimitsType;
  widgetId: string;
}
//
// const INIT_ELEMENT_STYLES = {
//   title: {
//     fontSize: 7,
//     marginBottom: 16,
//   },
//   answers: {
//     gap: 10,
//   },
//   answer: {
//     padding: 10,
//     marginBottom: 10,
//     gap: 10,
//     borderRadius: 50,
//   },
//   emoji: {
//     width: 17,
//   },
//   answerTitle: {
//     fontSize: 11,
//     marginLeft: 10,
//   },
// };

const useScalableSizes = (props: Props) => {
  const { elementsSize } = props;

  const calculate = React.useCallback((size) => {
    return size;
  }, []);

  return React.useMemo(
    () => ({
      title: {
        fontSize: elementsSize?.title.fontSize,
        marginBottom: calculate(elementsSize?.title.marginBottom),
      },
      answers: {
        gap: calculate(elementsSize?.answers.gap),
      },
      answer: {
        padding: calculate(elementsSize?.answer.padding),
        marginBottom: calculate(elementsSize?.answer.gap),
        gap: calculate(elementsSize?.answer.gap),
        borderRadius: calculate(elementsSize?.answer.borderRadius),
      },
      emoji: {
        width: calculate(elementsSize?.emoji.width),
      },
      answerTitle: {
        fontSize: calculate(elementsSize?.answerTitle.fontSize),
        marginLeft: calculate(elementsSize?.answer.gap),
      },
    }),
    [calculate]
  );
};

export const QuizOneAnswerWidget: React.FC<Props> = (props) => {
  const { params, widgetId } = props;
  const sizes = useScalableSizes(props);

  const { onQuizAnswer, mode } = React.useContext(QuizContenxt);
  const [selectedAnswer, setAnswer] = useAnswersCache<string>(widgetId);

  const handleAnswer =
    (answer: QuizOneAnswerWidgetParamsType['answers'][0]) => () => {
      onQuizAnswer({
        type: 'add',
        answer:
          mode === ScoreType.LETTERS
            ? answer.score.letter
            : answer.score.points,
      });
      setAnswer(answer.id);
    };

  return (
    <View style={styles.container}>
      {!params.isTitleHidden && (
        <Text style={[styles.title, sizes.title]}>{params.title}</Text>
      )}
      <View style={styles.list}>
        {params.answers.map((answer) => (
          <Pressable
            key={answer.id}
            style={[
              styles.answer,
              sizes.answer,
              selectedAnswer === answer.id && styles.answerSelected,
            ]}
            onPress={handleAnswer(answer)}
          >
            {answer.emoji && (
              <Emoji emoji={answer.emoji.unicode} size={sizes.emoji.width} />
            )}
            <Text
              style={[
                styles.answerTitle,
                sizes.answerTitle,
                selectedAnswer === answer.id && styles.selectedTitle,
              ]}
            >
              {answer.title}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
  },
  title: {
    textAlign: 'center',
    color: 'white',
  },
  list: {
    display: 'flex',
  },
  answer: {
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  answerTitle: {
    fontWeight: 'bold',
  },
  answerSelected: {
    backgroundColor: stylesUtils.getThemeColor('black'),
  },
  selectedTitle: {
    color: 'white',
  },
});
