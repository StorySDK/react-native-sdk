import React from 'react';
import { StyleSheet, View, Text, Pressable, Image } from 'react-native';
import {
  type QuizMultipleAnswerWithImageWidgetParamsType,
  type WidgetPositionLimitsType,
  type WidgetPositionType,
  type QuizMultipleAnswerWidgetWithImageElementsType,
  ScoreType,
} from '../../types';
import { stylesUtils } from '../../utils';
import { QuizContenxt } from '../../components/StoriesList';
import { useAnswersCache } from '../../hooks/useAnswerCache';

interface Props {
  params: QuizMultipleAnswerWithImageWidgetParamsType;
  elementsSize?: QuizMultipleAnswerWidgetWithImageElementsType;
  position: WidgetPositionType;
  positionLimits: WidgetPositionLimitsType;
  widgetId: string;
}

// const INIT_ELEMENT_STYLES = {
//   title: {
//     fontSize: 14,
//     marginBottom: 16,
//   },
//   answers: {
//     gap: 5,
//   },
//   answer: {
//     padding: 4,
//     gap: 5,
//     borderRadius: 5,
//   },
//   emoji: {
//     width: 11,
//   },
//   answerTitle: {
//     fontSize: 11,
//   },
//   sendBtn: {
//     fontSize: 11,
//     borderRadius: 5,
//     padding: 10,
//     marginTop: 5,
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
        padding: calculate(elementsSize?.answer.padding),
        marginRight: calculate(elementsSize?.answers.gap),
        gap: calculate(elementsSize?.answer.gap),
        borderRadius: calculate(elementsSize?.answer.borderRadius),
      },
      emoji: {
        width: calculate(
          elementsSize?.emoji.width || elementsSize?.emoji.width
        ),
        height: calculate(
          elementsSize?.emoji.width || elementsSize?.emoji.width
        ),
      },
      answerTitle: {
        fontSize: calculate(elementsSize?.answerTitle.fontSize),
      },
      sendBtn: {
        fontSize: calculate(elementsSize?.sendBtn.fontSize),
        borderRadius: calculate(elementsSize?.sendBtn.borderRadius),
        padding: calculate(elementsSize?.sendBtn.padding),
        marginTop: calculate(elementsSize?.sendBtn.marginTop),
      },
    }),
    [calculate]
  );
};

export const QuizMultipleAnswerWithImageWidget: React.FC<Props> = (props) => {
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
              { width: `${100 / params.answers.length}%` },
              userAnswers.includes(answer.id) && styles.answerSelected,
            ]}
            key={answer.id}
            onPress={() => handleAnswer(answer.id)}
          >
            <View style={[styles.answerImgPlaceholder]}>
              {answer.image && (
                <Image
                  source={{ uri: answer.image.url }}
                  style={[styles.answerImg]}
                />
              )}
            </View>
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
    fontWeight: 'bold',
  },
  list: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
  },
  answer: {
    backgroundColor: 'white',
    position: 'relative',
  },
  answerImg: {
    width: '100%',
    aspectRatio: 1,
  },
  answerImgPlaceholder: {
    width: '100%',
    backgroundColor: '#dddbde',
    aspectRatio: 1,
  },
  answerTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  answerSelected: {
    backgroundColor: stylesUtils.getThemeColor('black'),
  },
  selectedTitle: {
    color: 'white',
  },
});
