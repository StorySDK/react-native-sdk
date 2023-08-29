import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  Image,
  Pressable,
} from 'react-native';
import type {
  TalkAboutWidgetParamsType,
  WidgetPositionLimitsType,
  WidgetPositionType,
} from '../../types';
import Reactions from '../../core/Reactions';
import { stylesUtils } from '../../utils';
import StoryContext from '../../core/StoryContext';
import type { TalkAboutElementsType } from '../../types';

interface Props {
  params: TalkAboutWidgetParamsType;
  position: WidgetPositionType;
  elementsSize: TalkAboutElementsType;
  positionLimits: WidgetPositionLimitsType;
  widgetId: string;
}


export const TalkAboutWidget: React.FC<Props> = (props) => {
  const { params, position, positionLimits, elementsSize, widgetId } = props;

  const storyContextVal = React.useContext(StoryContext);
  const [text, setText] = React.useState('');
  const ref = React.useRef<any>(null);

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
        paddingRight: elementsSize.content.paddingRight,
        paddingLeft: elementsSize.content.paddingLeft,
        paddingBottom: elementsSize.content.paddingBottom,
        paddingTop: elementsSize.content.paddingTop,
        borderRadius: elementsSize.widget.borderRadius,
        backgroundColor: stylesUtils.getThemeColor(params.color),
      },
      title: {
        fontSize: elementsSize.text.fontSize,
        // lineHeight: elementsSize.text.lineHeight,
        marginBottom: elementsSize.text.marginBottom,
        color: stylesUtils.getThemeContrastColor(params.color),
      },
      input: {
        fontSize: elementsSize.input.fontSize,
        // lineHeight: elementsSize.input,
        padding: elementsSize.input.padding,
        borderRadius: elementsSize.input.borderRadius,
        color: stylesUtils.getThemeContrastColor(params.color),
        backgroundColor: stylesUtils.getThemeOpacityColor(params.color),
      },
      empty: {
        height: elementsSize.empty.height,
      },
      image: {
        width: elementsSize.imageWrapper.width,
        height: elementsSize.imageWrapper.height,
        top: -(elementsSize.imageWrapper.height / 2),
        transform: [
          {
            translateX: -(elementsSize.imageWrapper.width / 5),
          },
        ],
      },
      send: {
        height: elementsSize.send.height,
      },
      sendText: {
        fontSize: elementsSize.sendText.fontSize,
      },
    }),
    [calculate, params.color]
  );

  const handlePress = () => {
    if (ref) {
      ref.current.focus();
    }
  };

  const handleFocus = () => {
    storyContextVal.playStatusChange('pause');
    storyContextVal.setForegroundWidget(widgetId);
  };

  const handleBlur = () => {
    Reactions.registerWidget(widgetId);
    Reactions.send('answer', text);
    storyContextVal.playStatusChange('play');
    storyContextVal.setForegroundWidget(null);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.container, elementSizes.container]}
    >
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
          ref={ref}
          style={[styles.field, elementSizes.input]}
          placeholder="Enter text..."
          onChangeText={setText}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </View>
    </Pressable>
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
