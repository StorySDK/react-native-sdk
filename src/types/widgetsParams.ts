import type { BackgroundType } from './index';

type EmojiType = {
  name: string;
  unicode: string;
};

export type RectangleWidgetParamsType = {
  fillColor: BackgroundType;
  fillBorderRadius: number;
  fillOpacity: number;
  strokeThickness: number;
  strokeColor: { type: string; value: string };
  strokeOpacity: number;
  hasBorder: boolean;
};

export type EllipseWidgetParamsType = {
  fillColor: BackgroundType;
  fillOpacity: number;
  strokeThickness: number;
  strokeColor: { type: string; value: string };
  strokeOpacity: number;
  hasBorder: boolean;
};

export type ClickMeWidgetParamsType = {
  fontFamily: string;
  fontSize: number;
  color: BackgroundType;
  text: string;
  icon: any;
  url: string;
  borderRadius: number;
  backgroundColor: BackgroundType;
  hasBorder: boolean;
  borderWidth: number;
  borderColor: BackgroundType;
};

export type ChooseAnswerWidgetParamsType = {
  text: string;
  color: string;
  markCorrectAnswer: boolean;
  answers: Array<{ id: string; title: string }>;
  correct: string;
};

export type EmojiReactionWidgetParamsType = {
  emoji: EmojiType[];
  color: string;
};

export type GiphyWidgetParamsType = {
  gif: string;
};

export type QuestionWidgetParamsType = {
  question: string;
  confirm: string;
  decline: string;
  color: string;
};

export type SliderWidgetParamsType = {
  color: string;
  emoji: EmojiType;
  text: string;
  value: number;
};

export type SwipeUpWidgetParamsType = {
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  url: string;
  icon: any;
};

export type TalkAboutWidgetParamsType = {
  text: string;
  image: string;
  color: string;
};

export type TextWidgetParamsType = {
  text: string;
  fontSize: number;
  fontFamily: string;
  align: string;
  color: string;
  withFill: boolean;
  opacity: number;
};

export type TimerWidgetParamsType = {
  time: number;
  text: string;
  color: string;
};
