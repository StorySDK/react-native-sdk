import React from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { ConfirmIcon } from '../../icons/ConfirmIcon';
import { DeclineIcon } from '../../icons/DeclineIcon';

interface AnswerProps {
  id: string;
  title: string;

  onMark(): void;

  voted: boolean;
  correct: boolean;
  choosen: boolean;
  calculatedStyles: {
    answer: ViewStyle | TextStyle | ImageStyle;
    answerId: ViewStyle | TextStyle | ImageStyle;
    answerIdText: ViewStyle | TextStyle | ImageStyle;
    answerTitle: ViewStyle | TextStyle | ImageStyle;
  };
}

export const Answer: React.FC<AnswerProps> = ({
  id,
  title,
  onMark,
  voted,
  correct,
  choosen,
  calculatedStyles,
}) => {
  const handleMarkAnswer = () => {
    onMark();
  };

  const renderVariantKey = () => {
    if (!voted) {
      return (
        <View
          style={[
            styles.variantCircle,
            voted && styles.variantMarked,
            calculatedStyles.answerId,
          ]}
        >
          <Text style={[styles.variantId, calculatedStyles.answerIdText]}>
            {id}
          </Text>
        </View>
      );
    }

    if (correct) {
      return (
        <View
          style={[
            styles.variantCircle,
            voted && correct && styles.variantCircle__correct,
            calculatedStyles.answerId,
          ]}
        >
          <View style={[styles.variantIcon]}>
            <ConfirmIcon color="#fff" />
          </View>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.variantCircle,
          voted &&
            !correct &&
            choosen &&
            styles.variantCircle__incorrectChoosen,
          voted && !correct && styles.variantCircle__incorrect,
          calculatedStyles.answerId,
        ]}
      >
        <View style={[styles.variantIcon]}>
          <DeclineIcon color={voted && !correct && 'rgba(214,39,39,0.8)'} />
        </View>
      </View>
    );
  };

  return (
    <Pressable
      style={[
        styles.container,
        voted && correct && styles.container__correct,
        voted && !correct && choosen && styles.container__incorrect,
        calculatedStyles.answer,
      ]}
      onPress={handleMarkAnswer}
    >
      {renderVariantKey()}
      <Text
        style={[
          styles.title,
          voted && !correct && !choosen && styles.title__voted,
          voted && correct && styles.title__correct,
          voted && !correct && choosen && styles.title__correct,
          calculatedStyles.answerTitle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 50,
    padding: 8,
  },
  container__correct: {
    backgroundColor: 'rgba(68,217,55,0.8)',
    borderColor: 'rgba(68,217,55,0.8)',
  },
  container__incorrect: {
    backgroundColor: 'rgba(214,39,39,0.8)',
    borderColor: 'rgba(214,39,39,0.8)',
  },
  container__marked: {},
  variantMarked: {
    borderColor: '#44d937',
    backgroundColor: '#44d937',
  },
  variantCircle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: '#18182e',
    borderRadius: 50,
    marginRight: 8,
  },
  variantCircle__correct: {
    backgroundColor: 'transparent',
    borderColor: '#fff',
  },
  variantCircle__incorrectChoosen: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  variantCircle__incorrect: {
    borderColor: 'rgba(214,39,39,0.8)',
  },
  variantIcon: {
    transform: [{ scale: 0.4 }],
  },
  variantId: {
    color: '#18182e',
  },
  title: {
    fontSize: 10,
    color: '#18182e',
  },
  title__voted: {
    color: '#18182e',
    opacity: 0.5,
  },
  title__correct: {
    color: '#fff',
  },
});
