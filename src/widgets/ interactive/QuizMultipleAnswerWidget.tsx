import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import type { WidgetPositionLimitsType, WidgetPositionType } from '../../types';
import type {
  QuizMultipleAnswerWidgetParamsType,
  QuizMultipleAnswerWidgetElementsType,
} from '../../types';
import Emoji from '../../components/Emoji';
import { stylesUtils } from '../../utils';
import { QuizContenxt } from '../../components/StoriesList';
import { useAnswersCache } from '../../hooks/useAnswerCache';
import { ScoreType } from '../../types';

interface Props {
  params: QuizMultipleAnswerWidgetParamsType;
  elementsSize?: QuizMultipleAnswerWidgetElementsType;
  position: WidgetPositionType;
  positionLimits: WidgetPositionLimitsType;
  widgetId: string;
}

// const INIT_ELEMENT_STYLES = {
//   title: {
//     fontSize: 14,
//     marginBottom: 16,
//   },
//   answer: {
//     marginRight: 5,
//     padding: 5,
//     borderRadius: 50,
//   },
//   emoji: {
//     width: 11,
//   },
//   answerTitle: {
//     fontSize: 8,
//     marginLeft: 5,
//   },
//   sendBtn: {
//     fontSize: 8,
//     borderRadius: 20,
//     padding: 5,
//     marginTop: 5,
//     lineHeight: 11,
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
        fontSize: calculate(elementsSize?.title.fontSize),
        marginBottom: calculate(elementsSize?.title.marginBottom),
      },
      answer: {
        marginRight: calculate(elementsSize?.answer.gap),
        padding: calculate(elementsSize?.answer.padding),
        borderRadius: calculate(elementsSize?.answer.borderRadius),
      },
      emoji: {
        width: calculate(elementsSize?.emoji.width),
      },
      answerTitle: {
        fontSize: calculate(elementsSize?.answerTitle.fontSize),
        marginLeft: calculate(elementsSize?.answer.gap),
      },
      sendBtn: {
        fontSize: calculate(elementsSize?.sendBtn.fontSize),
        borderRadius: calculate(elementsSize?.sendBtn.borderRadius),
        padding: calculate(elementsSize?.sendBtn.padding),
        marginTop: calculate(elementsSize?.sendBtn.marginTop),
        lineHeight: calculate(elementsSize?.sendBtn.lineHeight),
      },
    }),
    [calculate]
  );
};

export const QuizMultipleAnswerWidget: React.FC<Props> = (props) => {
  const { params, widgetId } = props;

  const sizes = useScalableSizes(props);

  const { onQuizAnswer, mode } = React.useContext(QuizContenxt);
  const [userAnswers, setUserAnswers] = useAnswersCache<string[]>(widgetId, []);

  const handleSendScore = React.useCallback(
    (currentAnswers: string[], type: 'add' | 'remove') => {
      if (!mode) {
        return;
      }

      const answerScore = currentAnswers.length
        ? params.answers
            .filter((answer) => currentAnswers.includes(answer.id))
            .reduce(
              (acc, answer) => {
                if (mode === ScoreType.LETTERS) {
                  return acc + answer.score.letter;
                }
                if (mode === ScoreType.NUMBERS) {
                  return +acc + +answer.score.points;
                }
                return acc;
              },
              mode === ScoreType.LETTERS ? '' : 0
            )
        : undefined;

      if (answerScore !== undefined && mode && onQuizAnswer) {
        onQuizAnswer({ type, answer: answerScore });
      }
    },
    [params.answers]
  );

  const handleAnswer = React.useCallback(
    (answerId: string) => {
      if (userAnswers.includes(widgetId)) {
        handleSendScore([answerId], 'remove');

        setUserAnswers(userAnswers.filter((answer) => answer !== answerId));
      } else {
        handleSendScore([answerId], 'add');
        setUserAnswers([...userAnswers, answerId]);
      }
    },
    [handleSendScore, widgetId, userAnswers]
  );

  return (
    <View style={styles.container}>
      {!params.isTitleHidden && (
        <Text style={[styles.title, sizes.title]}>{params.title}</Text>
      )}
      <View style={styles.list}>
        {params.answers.map((answer) => (
          <Pressable
            style={[
              styles.answer,
              sizes.answer,
              userAnswers.includes(answer.id) && styles.answerSelected,
            ]}
            key={answer.id}
            onPress={() => handleAnswer(answer.id)}
          >
            {answer.emoji && (
              <Emoji emoji={answer.emoji.unicode} size={sizes.emoji.width} />
            )}
            <Text
              style={[
                styles.answerTitle,
                sizes.answerTitle,
                userAnswers.includes(answer.id) && styles.selectedTitle,
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
  container: {},
  title: {
    textAlign: 'center',
    color: 'white',
  },
  list: {
    display: 'flex',
    flexDirection: 'row',
  },
  answer: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  answerTitle: {},
  answerSelected: {
    backgroundColor: stylesUtils.getThemeColor('black'),
  },
  selectedTitle: {
    color: 'white',
  },
});
