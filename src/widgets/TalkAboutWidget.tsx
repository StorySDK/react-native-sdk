import React from 'react';
import { StyleSheet, View, TextInput, Text, Image } from 'react-native';
import type {
  TalkAboutWidgetParamsType,
  WidgetPositionLimitsType,
  WidgetPositionType,
} from '../types';
import Reactions from '../core/Reactions';
import { stylesUtils } from '../utils';
import StoryContext from '../core/StoryContext';

interface Props {
  params: TalkAboutWidgetParamsType;
  position: WidgetPositionType;
  positionLimits: WidgetPositionLimitsType;
  widgetId: string;
}

const INIT_ELEMENT_STYLES = {
  container: {
    paddingTop: 20,
  },
  card: {
    borderRadius: 10,
    paddingRight: 12,
    paddingLeft: 12,
    paddingBottom: 12,
    paddingTop: 30,
  },
  title: {
    fontSize: 14,
    lineHeight: 16.8,
    marginBottom: 15,
  },
  input: {
    fontSize: 10,
    lineHeight: 16,
    padding: 4,
    borderRadius: 8,
  },
  empty: {
    height: 18,
  },
  image: {
    width: 36,
    height: 36,
    borderWidth: 2,
  },
  send: {
    height: 50,
  },
  sendText: {
    fontSize: 14,
  },
};

export const TalkAboutWidget: React.FC<Props> = (props) => {
  const { params, position, positionLimits, widgetId } = props;

  const storyContextVal = React.useContext(StoryContext);

  const calculate = React.useCallback(
    (size) => {
      if (position && positionLimits) {
        return stylesUtils.calculateElementSize(position, positionLimits, size);
      }

      return size;
    },
    [position, positionLimits]
  );

  const elementSizes = React.useMemo(
    () => ({
      container: {
        paddingTop: 20,
      },
      card: {
        paddingRight: calculate(INIT_ELEMENT_STYLES.card.paddingRight),
        paddingLeft: calculate(INIT_ELEMENT_STYLES.card.paddingLeft),
        paddingBottom: calculate(INIT_ELEMENT_STYLES.card.paddingBottom),
        paddingTop: calculate(INIT_ELEMENT_STYLES.card.paddingTop),
        borderRadius: calculate(INIT_ELEMENT_STYLES.card.borderRadius),
        backgroundColor: stylesUtils.getThemeColor(params.color),
      },
      title: {
        fontSize: calculate(INIT_ELEMENT_STYLES.title.fontSize),
        lineHeight: calculate(INIT_ELEMENT_STYLES.title.lineHeight),
        marginBottom: calculate(INIT_ELEMENT_STYLES.title.marginBottom),
        color: stylesUtils.getThemeContrastColor(params.color),
      },
      input: {
        fontSize: calculate(INIT_ELEMENT_STYLES.input.fontSize),
        lineHeight: calculate(INIT_ELEMENT_STYLES.input.lineHeight),
        padding: calculate(INIT_ELEMENT_STYLES.input.padding),
        borderRadius: calculate(INIT_ELEMENT_STYLES.input.borderRadius),
        color: stylesUtils.getThemeContrastColor(params.color),
        backgroundColor: stylesUtils.getThemeOpacityColor(params.color),
      },
      empty: {
        height: calculate(INIT_ELEMENT_STYLES.empty.height),
      },
      image: {
        width: calculate(INIT_ELEMENT_STYLES.image.width),
        height: calculate(INIT_ELEMENT_STYLES.image.height),
        top: -(calculate(INIT_ELEMENT_STYLES.image.height) / 2),
        transform: [
          {
            translateX: -(calculate(INIT_ELEMENT_STYLES.image.width) / 5),
          },
        ],
      },
      send: {
        height: calculate(INIT_ELEMENT_STYLES.send.height),
      },
      sendText: {
        fontSize: calculate(INIT_ELEMENT_STYLES.sendText.fontSize),
      },
    }),
    [calculate, params.color]
  );

  const [text, setText] = React.useState('');

  const handleFocus = () => {
    // const widgetBottomPoint = (position.y + position.height) / PixelRatio.get();
    // const keyboardTopPoint = 1920 / PixelRatio.get() - 280;

    storyContextVal.playStatusChange('pause');
    storyContextVal.setForegroundWidget(widgetId);
    // storyContextVal.setContentShift(
    //   widgetBottomPoint >= keyboardTopPoint
    //     ? keyboardTopPoint - widgetBottomPoint
    //     : 0
    // );
  };

  const handleBlur = () => {
    Reactions.registerWidget(widgetId);
    Reactions.send('answer', text);
    storyContextVal.playStatusChange('play');
    storyContextVal.setForegroundWidget(null);
    // storyContextVal.setContentShift(0);
  };

  return (
    <View style={[styles.container, elementSizes.container]}>
      <View style={[styles.card, elementSizes.card]}>
        <Image
          source={{
            uri:
              params.image || 'https://storysdk.com/android-chrome-192x192.png',
          }}
          style={[styles.image, elementSizes.image]}
        />
        <Text style={[styles.title, elementSizes.title]}>{params.text}</Text>
        <TextInput
          style={[styles.field, elementSizes.input]}
          placeholder="Enter text..."
          onChangeText={setText}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
  },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    paddingTop: 30,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  image: {
    position: 'absolute',
    left: '50%',
    borderRadius: 500,
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  title: {
    fontSize: 14,
    lineHeight: 16.8,
    marginBottom: 15,
    fontWeight: '500',
    color: '#05051d',
    textAlign: 'center',
  },
  field: {
    width: '100%',
    backgroundColor: 'rgba(5,5,29,.15)',
    color: 'rgba(5,5,29,.6)',
    textAlign: 'center',
  },
});
