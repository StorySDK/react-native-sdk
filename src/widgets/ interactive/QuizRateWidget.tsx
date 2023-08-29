import React from 'react';
import { StyleSheet, View, Text, Pressable, Linking } from 'react-native';
import type {
  WidgetPositionLimitsType,
  WidgetPositionType,
} from '../../types';
import type {
  QuizRateWidgetParamsType,
  QuizRateWidgetElementsType,
} from '../../types';
import { RateStarIcon } from '../../icons/RateStarIcon';
import Reactions from '../../core/Reactions';

interface Props {
  params: QuizRateWidgetParamsType;
  elementsSize: QuizRateWidgetElementsType;
  position: WidgetPositionType;
  positionLimits: WidgetPositionLimitsType;
  widgetId: string;
}

// const INIT_ELEMENT_STYLES = {
//   title: {
//     fontSize: 14,
//     marginBottom: 16
//   },
//   stars: {
//     gap: 10
//   }
// };

const useScalableSizes = (props: Props) => {
  const { elementsSize } = props;

  return {
    title: {
      fontSize: elementsSize?.title.fontSize,
      marginBottom: elementsSize?.title.marginBottom,
    },
    star: {
      paddingLeft: elementsSize.stars.gap / 2,
      paddingRight: elementsSize.stars.gap / 2,
    },
  };
};

export const QuizRateWidget: React.FC<Props> = (props) => {
  const { params, widgetId } = props;

  const sizes = useScalableSizes(props);

  const handlePress = async () => {
    Reactions.registerWidget(widgetId);
    Reactions.send('click');

    if (params.storeLinks.reactNative) {
      Linking.canOpenURL(params.storeLinks.reactNative).then((can) => {
        if (can) {
          Linking.openURL(params.storeLinks.reactNative);
        }
      });
    }
  };

  return (
    <View style={styles.container}>
      {!params.isTitleHidden && (
        <Text style={[styles.title, sizes.title]}>{params.title}</Text>
      )}
      <Pressable style={[styles.list]} onPress={handlePress}>
        {[1, 2, 3, 4, 5].map((v) => (
          <View key={v} style={[styles.star, sizes.star]}>
            <RateStarIcon />
          </View>
        ))}
      </Pressable>
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
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
  },
  star: {
    width: '20%',
    aspectRatio: 1,
  },
});
