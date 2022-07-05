import React from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import type {
  ChooseAnswerWidgetParamsType,
  WidgetPositionLimitsType,
  WidgetPositionType,
} from '../../types';
import { styles } from './styles';
import { Answer } from './Answer';
import { stylesUtils } from '../../utils';
import Reactions from '../../core/Reactions';

interface Props {
  params: ChooseAnswerWidgetParamsType;
  position: WidgetPositionType;
  positionLimits: WidgetPositionLimitsType;
  widgetId: string;
}

const INIT_ELEMENT_STYLES = {
  container: {
    borderRadius: 10,
  },
  header: {
    fontSize: 12,
    paddingTop: 13,
    paddingBottom: 13,
  },
  answers: {
    padding: 12,
  },
  answer: {
    padding: 8,
    marginBottom: 6,
  },
  answerId: {
    width: 18,
    height: 18,
    marginRight: 8,
    fontSize: 10,
  },
  answerTitle: {
    fontSize: 10,
  },
};

export const ChooseAnswerWidget: React.FC<Props> = ({
  params,
  position,
  positionLimits,
  widgetId,
}) => {
  const { text, answers, correct } = params;

  const shakeAnimation = new Animated.Value(0);
  const celebrateAnimation = new Animated.Value(0);

  const [userAnswer, setUserAnswer] = React.useState<null | string>(null);
  const handleMarkAnswer = (answerId: string) => () => {
    if (!userAnswer) {
      setUserAnswer(answerId);

      Reactions.registerWidget(widgetId);
      Reactions.send('answer', answerId);
    }
  };

  React.useEffect(() => {
    if (!!userAnswer && userAnswer !== correct) {
      Animated.timing(shakeAnimation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    }

    if (!!userAnswer && userAnswer === correct) {
      Animated.timing(celebrateAnimation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    }
  }, [celebrateAnimation, correct, shakeAnimation, userAnswer]);

  const calculate = (size: number) => {
    if (position && positionLimits) {
      return stylesUtils.calculateElementSize(position, positionLimits, size);
    }

    return size;
  };

  const elementSizes = React.useMemo(
    () => ({
      container: {
        borderRadius: calculate(INIT_ELEMENT_STYLES.container.borderRadius),
      },
      header: {
        paddingTop: calculate(INIT_ELEMENT_STYLES.header.paddingTop),
        paddingBottom: calculate(INIT_ELEMENT_STYLES.header.paddingBottom),
      },
      title: {
        fontSize: calculate(INIT_ELEMENT_STYLES.header.fontSize),
      },
      answers: {
        padding: calculate(INIT_ELEMENT_STYLES.answers.padding),
      },
      answer: {
        padding: calculate(INIT_ELEMENT_STYLES.answer.padding),
        marginBottom: calculate(INIT_ELEMENT_STYLES.answer.marginBottom),
      },
      answerId: {
        width: calculate(INIT_ELEMENT_STYLES.answerId.width),
        height: calculate(INIT_ELEMENT_STYLES.answerId.height),
        marginRight: calculate(INIT_ELEMENT_STYLES.answerId.marginRight),
      },
      answerIdText: {
        fontSize: calculate(INIT_ELEMENT_STYLES.answerId.fontSize),
      },
      answerTitle: {
        fontSize: calculate(INIT_ELEMENT_STYLES.answerTitle.fontSize),
      },
    }),
    [calculate]
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {
              translateX: shakeAnimation.interpolate({
                inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
                outputRange: [0, -10, 10, -10, 10, -10, 10, -10, 10, -10, 0],
              }),
            },
            {
              scale: celebrateAnimation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 1.5, 1],
              }),
            },
          ],
        },
        elementSizes.container,
      ]}
    >
      <View
        style={[
          styles.header,
          elementSizes.header,
          { backgroundColor: stylesUtils.getThemeColor(params.color) },
        ]}
      >
        <Text
          style={[
            styles.title,
            elementSizes.title,
            { color: stylesUtils.getThemeContrastColor(params.color) },
          ]}
        >
          {text}
        </Text>
      </View>
      <View style={[styles.answers, elementSizes.answers]}>
        {answers.map(({ id, title }) => (
          <Answer
            key={id}
            id={id}
            title={title}
            onMark={handleMarkAnswer(id)}
            correct={id === correct}
            voted={!!userAnswer}
            choosen={id === userAnswer}
            calculatedStyles={{
              answer: elementSizes.answer,
              answerId: elementSizes.answerId,
              answerIdText: elementSizes.answerIdText,
              answerTitle: elementSizes.answerTitle,
            }}
          />
        ))}
      </View>
    </Animated.View>
  );
};
