import React from 'react';
import { LinearTextGradient } from 'react-native-text-gradient';
import { StyleSheet, View, Text, Pressable, Animated } from 'react-native';
import type {
  QuestionWidgetParamsType,
  WidgetPositionLimitsType,
  WidgetPositionType,
} from '../../types';
import Reactions from '../../core/Reactions';
import type { QuestionWidgetElementsType } from '../../types';

interface Props {
  params: QuestionWidgetParamsType;
  position: WidgetPositionType;
  elementsSize: QuestionWidgetElementsType;
  positionLimits: WidgetPositionLimitsType;
  widgetId: string;
}

const INIT_ELEMENT_STYLES = {
  text: {
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 10,
  },
  card: {
    borderRadius: 10,
    height: 50,
  },
  animatedWrapper: {
    height: 50,
  },
  button: {
    borderRadius: 10,
  },
  buttonTitle: {
    fontSize: 24,
  },
  percentText: {
    fontSize: 20,
  },
  textMarked: {
    fontSize: 16,
  },
};

const useScalableSizes = (props: Props) => {
  const { elementsSize, position, positionLimits } = props;

  const calculate = React.useCallback(
    (size) => {
      // if (position && positionLimits) {
      //   return stylesUtils.calculateElementSize(position, positionLimits, size);
      // }

      return size;
    },
    [position, positionLimits]
  );

  return React.useMemo(
    () => ({
      text: {
        fontSize: elementsSize.text.fontSize,
        lineHeight: INIT_ELEMENT_STYLES.text.lineHeight,
        marginBottom: elementsSize.text.marginBottom,
      },
      card: {
        height: INIT_ELEMENT_STYLES.card.height,
        borderRadius: INIT_ELEMENT_STYLES.card.borderRadius,
      },
      animatedWrapper: {
        height: INIT_ELEMENT_STYLES.animatedWrapper.height,
      },
      button: {
        height: elementsSize.button.height,
        borderRadius: elementsSize.button.borderRadius,
      },
      buttonTitle: {
        fontSize: elementsSize.button.fontSize,
      },
      textMarked: {
        fontSize: INIT_ELEMENT_STYLES.textMarked.fontSize,
      },
      percentText: {
        fontSize: INIT_ELEMENT_STYLES.percentText.fontSize,
      },
    }),
    [calculate]
  );
};

export const QuestionWidget: React.FC<Props> = (props) => {
  const { params, widgetId } = props;
  const elementSizes = useScalableSizes(props);

  const confirmAnim = React.useRef(new Animated.Value(50)).current;
  const declineAnim = React.useRef(new Animated.Value(50)).current;
  const [answer, setAnswer] = React.useState<'confirm' | 'decline' | null>(
    null
  );
  const [percents, setPercents] = React.useState({
    confirm: 0,
    decline: 0,
  });

  const handleSelect = (option: 'confirm' | 'decline') => () => {
    if (!answer) {
      Reactions.registerWidget(widgetId);
      Reactions.send('answer', option).then((data: any) => {
        setPercents(data);
        Animated.timing(confirmAnim, {
          useNativeDriver: false,
          toValue: calculateWidth(data.confirm),
          duration: 250,
        }).start();
        Animated.timing(declineAnim, {
          useNativeDriver: false,
          toValue: calculateWidth(data.decline),
          duration: 250,
        }).start();
      });
      setAnswer(option);
    }
  };

  const calculateWidth = (percent: number) => {
    if (percent === 0) {
      return 0;
    }
    if (percent === 100) {
      return 100;
    }
    if (percent < 25) {
      return 30;
    }
    if (percent > 75) {
      return 70;
    }

    return percent;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, elementSizes.text]}>{params.question}</Text>
      <View style={[styles.card, elementSizes.card]}>
        <Animated.View
          style={[
            elementSizes.animatedWrapper,
            styles.confirm,
            answer && styles.marked,
            {
              width: confirmAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        >
          <Pressable
            style={[styles.button, elementSizes.button]}
            onPress={handleSelect('confirm')}
          >
            <LinearTextGradient
              locations={[0, 1]}
              colors={['#37D9BC', '#44D937']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.buttonTitle,
                elementSizes.buttonTitle,
                answer && elementSizes.textMarked,
              ]}
            >
              <Text>{params.confirm}</Text>
            </LinearTextGradient>
            {answer && (
              <Text style={[styles.percentText, elementSizes.percentText]}>
                {percents.confirm}%
              </Text>
            )}
          </Pressable>
        </Animated.View>
        <Animated.View
          style={[
            elementSizes.animatedWrapper,
            {
              width: declineAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        >
          <Pressable
            style={[styles.button, elementSizes.button]}
            onPress={handleSelect('decline')}
          >
            <LinearTextGradient
              locations={[0, 1]}
              colors={['#CE25CA', '#EA0E4E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.buttonTitle,
                elementSizes.buttonTitle,
                answer && elementSizes.textMarked,
              ]}
            >
              <Text>{params.decline}</Text>
            </LinearTextGradient>
            {answer && (
              <Text style={[styles.percentText, elementSizes.percentText]}>
                {percents.decline}%
              </Text>
            )}
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  card: {
    display: 'flex',
    backgroundColor: 'white',
    flexDirection: 'row',
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  title: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  button: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  marked: {
    flexDirection: 'column',
  },
  percentText: {
    color: '#000',
  },
  confirm: {
    borderRightWidth: 2,
    borderRightColor: '#DBDBDB',
  },
  buttonTitle: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
