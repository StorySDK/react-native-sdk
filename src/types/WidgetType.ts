import type {
  ChooseAnswerWidgetParamsType,
  ClickMeWidgetParamsType,
  EllipseWidgetParamsType,
  EmojiReactionWidgetParamsType,
  GiphyWidgetParamsType,
  QuestionWidgetParamsType,
  RectangleWidgetParamsType,
  SliderWidgetParamsType,
  SwipeUpWidgetParamsType,
  TalkAboutWidgetParamsType,
  TextWidgetParamsType,
  TimerWidgetParamsType,
} from './widgetsParams';
import type { WidgetsTypes } from './WidgetsTypes';

export type ColorValue = { type: 'color'; value: string };
export type GradientValue = { type: 'gradient'; value: string[] };
export type ImageValue = { type: 'image' | 'video'; value: string };

export type BackgroundType = GradientValue | ColorValue | ImageValue;

export type WidgetContentType =
  | { type: WidgetsTypes.GIPHY; params: GiphyWidgetParamsType }
  | { type: WidgetsTypes.TIMER; params: TimerWidgetParamsType }
  | {
      type: WidgetsTypes.CHOOSE_ANSWER;
      id: string | number;
      params: ChooseAnswerWidgetParamsType;
      onAnswer(): void;
    }
  | {
      type: WidgetsTypes.EMOJI_REACTION;
      id: string | number;
      params: EmojiReactionWidgetParamsType;
      onReact(): void;
    }
  | {
      type: WidgetsTypes.TALK_ABOUT;
      id: string | number;
      params: TalkAboutWidgetParamsType;
      onAnswer(): void;
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
  | { type: WidgetsTypes.RECTANGLE; params: RectangleWidgetParamsType };

export type WidgetPositionType = {
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
  isResizableX: boolean;
  isResizableY: boolean;
  isRotatable: boolean;
  maxWidth: number;
  minWidth: number;
  maxHeight?: number;
  minHeight?: number;
};

export interface WidgetObjectType {
  id: string | number;
  position: WidgetPositionType;
  positionLimits: WidgetPositionLimitsType;
  content: WidgetContentType;

  action?(): void;
}

export interface StoryType {
  id: string;
  storyData: WidgetObjectType[];
  background: BackgroundType;
  positionIndex: number;
}
