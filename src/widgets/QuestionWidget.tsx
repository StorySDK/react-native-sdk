import React from 'react';
import { LinearTextGradient } from 'react-native-text-gradient';
import { StyleSheet, View, Text, Pressable, Animated } from 'react-native';
import type {
  QuestionWidgetParamsType,
  WidgetPositionLimitsType,
  WidgetPositionType,
} from '../types';
import Reactions from '../core/Reactions';

interface Props {
  params: QuestionWidgetParamsType;
  position: WidgetPositionType;
  positionLimits: WidgetPositionLimitsType;
  widgetId: string;
}

export const QuestionWidget: React.FC<Props> = ({ params, widgetId }) => {
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
      return 25;
    }
    if (percent > 75) {
      return 75;
    }

    return percent;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{params.question}</Text>
      <View style={styles.card}>
        <Animated.View
          style={[
            styles.animatedWrapper,
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
          <Pressable style={[styles.button]} onPress={handleSelect('confirm')}>
            <LinearTextGradient
              locations={[0, 1]}
              colors={['#37D9BC', '#44D937']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.confirmText, answer && styles.textMarked]}
            >
              <Text>{params.confirm}</Text>
            </LinearTextGradient>
            {answer && (
              <Text style={styles.percentText}>{percents.confirm}%</Text>
            )}
          </Pressable>
        </Animated.View>
        <Animated.View
          style={[
            styles.animatedWrapper,
            styles.decline,
            answer && styles.marked,
            {
              width: declineAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        >
          <Pressable style={[styles.button]} onPress={handleSelect('decline')}>
            <LinearTextGradient
              locations={[0, 1]}
              colors={['#CE25CA', '#EA0E4E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.declineText, answer && styles.textMarked]}
            >
              <Text>{params.decline}</Text>
            </LinearTextGradient>
            {answer && (
              <Text style={styles.percentText}>{percents.decline}%</Text>
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
    borderRadius: 10,
    height: 50,
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
    paddingBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  animatedWrapper: {
    height: 50,
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
    fontSize: 20,
  },
  confirm: {
    borderRightWidth: 2,
    borderRightColor: '#DBDBDB',
  },
  confirmText: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  decline: {},
  declineText: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  textMarked: {
    fontSize: 16,
  },
});
