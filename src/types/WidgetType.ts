import type {
  ChooseAnswerWidgetParamsType,
  ClickMeWidgetParamsType,
  EllipseWidgetParamsType,
  EmojiReactionWidgetParamsType,
  GiphyWidgetParamsType,
  QuestionWidgetParamsType,
  QuizMultipleAnswerWidgetParamsType,
  QuizMultipleAnswerWithImageWidgetParamsType,
  QuizOneAnswerWidgetParamsType,
  QuizOpenAnswerWidgetParamsType,
  QuizRateWidgetParamsType,
  RectangleWidgetParamsType,
  SliderWidgetParamsType,
  SwipeUpWidgetParamsType,
  TalkAboutWidgetParamsType,
  TextWidgetParamsType,
  TimerWidgetParamsType,
} from './widgetsParams';
import type {
  ChooseAnswerWidgetElemetsType,
  EmojiReactionWidgetElemetsType,
  QuestionWidgetElementsType,
  QuizMultipleAnswerWidgetElementsType,
  QuizMultipleAnswerWidgetWithImageElementsType,
  QuizOneAnswerWidgetElementsType,
  QuizOpenAnswerWidgetElementsType,
  QuizRateWidgetElementsType,
  SliderWidgetElementsType,
  TalkAboutElementsType,
} from './widgetElementsTypes';
import { WidgetsTypes } from './WidgetsTypes';

export type ColorValue = { type: 'color'; value: string };
export type GradientValue = { type: 'gradient'; value: string[] };
export type ImageValue = { type: 'image' | 'video'; value: string };

export type BorderType = GradientValue | ColorValue;
export type BackgroundType = GradientValue | ColorValue | ImageValue;

export interface FontParamsType {
  style: string;
  weight: number;
}

export type WidgetContentType =
  | { type: WidgetsTypes.GIPHY; params: GiphyWidgetParamsType }
  | { type: WidgetsTypes.TIMER; params: TimerWidgetParamsType }
  | {
      type: WidgetsTypes.CHOOSE_ANSWER;
      id: string | number;
      params: ChooseAnswerWidgetParamsType;
    }
  | {
      type: WidgetsTypes.EMOJI_REACTION;
      id: string | number;
      params: EmojiReactionWidgetParamsType;
    }
  | {
      type: WidgetsTypes.TALK_ABOUT;
      id: string | number;
      params: TalkAboutWidgetParamsType;
    }
  | {
      type: WidgetsTypes.CLICK_ME;
      id: string | number;
      params: ClickMeWidgetParamsType;
      widgetImage: string;
      onClick(): void;
    }
  | {
      type: WidgetsTypes.QUESTION;
      id: string | number;
      params: QuestionWidgetParamsType;
      onAnswer(): void;
    }
  | {
      type: WidgetsTypes.SLIDER;
      id: string | number;
      params: SliderWidgetParamsType;
      onSlide(): void;
    }
  | {
      type: WidgetsTypes.SWIPE_UP;
      id: string | number;
      params: SwipeUpWidgetParamsType;
      widgetImage: string;
      onSwipe(): void;
    }
  | {
      type: WidgetsTypes.TEXT;
      params: TextWidgetParamsType;
      widgetImage: string;
    }
  | { type: WidgetsTypes.ELLIPSE; params: EllipseWidgetParamsType }
  | { type: WidgetsTypes.RECTANGLE; params: RectangleWidgetParamsType }
  | {
      type: WidgetsTypes.QUIZ_ONE_ANSWER;
      params: QuizOneAnswerWidgetParamsType;
    }
  | {
      type: WidgetsTypes.QUIZ_MULTIPLE_ANSWERS;
      params: QuizMultipleAnswerWidgetParamsType;
    }
  | {
      type: WidgetsTypes.QUIZ_OPEN_ANSWER;
      params: QuizOpenAnswerWidgetParamsType;
    }
  | {
      type: WidgetsTypes.QUIZ_MULTIPLE_ANSWER_WITH_IMAGE;
      params: QuizMultipleAnswerWithImageWidgetParamsType;
    }
  | { type: WidgetsTypes.QUIZ_RATE; params: QuizRateWidgetParamsType };

export type WidgetPositionType = {
  origin: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  x: number;
  y: number;
  width: number;
  height: number;
  realWidth: number;
  realHeight: number;
  rotate: number;
};

export type WidgetPositionLimitsType = {
  isAutoHeight: boolean;
  isAutoWidth: boolean;
  isResizableX: boolean;
  isResizableY: boolean;
  isRotatable: boolean;
  maxWidth: number;
  minWidth: number;
  maxHeight?: number;
  minHeight?: number;
};

export interface WidgetObjectType {
  widgetImage?: string;
  id: string;
  position: WidgetPositionType;
  editorPosition: WidgetPositionType;
  positionLimits: WidgetPositionLimitsType;
  content: WidgetContentType;
  elementsSize?:
    | ChooseAnswerWidgetElemetsType
    | EmojiReactionWidgetElemetsType
    | QuestionWidgetElementsType
    | QuizMultipleAnswerWidgetElementsType
    | QuizOneAnswerWidgetElementsType
    | QuizMultipleAnswerWidgetWithImageElementsType
    | QuizOpenAnswerWidgetElementsType
    | QuizRateWidgetElementsType
    | SliderWidgetElementsType
    | TalkAboutElementsType;
  editorElementsSize?:
    | ChooseAnswerWidgetElemetsType
    | EmojiReactionWidgetElemetsType
    | QuestionWidgetElementsType
    | QuizMultipleAnswerWidgetElementsType
    | QuizOneAnswerWidgetElementsType
    | QuizMultipleAnswerWidgetWithImageElementsType
    | QuizOpenAnswerWidgetElementsType
    | QuizRateWidgetElementsType
    | SliderWidgetElementsType
    | TalkAboutElementsType;
  action?(): void;
}

export interface LayerData {
  layersGroupId: string;
  positionInGroup: number;
  isDefaultLayer: boolean;
  score: {
    letter: string;
    points: number;
  };
}

export interface StoryType {
  id: string;
  storyData: WidgetObjectType[];
  layerData: LayerData;
  background: BackgroundType;
  startTime: string | null;
  endTime: string | null;
  positionIndex: number;
}

export const ScoreWidgets = [
  WidgetsTypes.CHOOSE_ANSWER,
  WidgetsTypes.QUIZ_ONE_ANSWER,
  WidgetsTypes.QUIZ_MULTIPLE_ANSWERS,
  WidgetsTypes.QUIZ_MULTIPLE_ANSWER_WITH_IMAGE,
];
