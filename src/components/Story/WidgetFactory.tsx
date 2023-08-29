import React from 'react';
import type {
  WidgetObjectType,
  ChooseAnswerWidgetElemetsType,
  QuestionWidgetElementsType,
  QuizMultipleAnswerWidgetElementsType,
  QuizMultipleAnswerWidgetWithImageElementsType,
  QuizOneAnswerWidgetElementsType,
  QuizOpenAnswerWidgetElementsType,
  QuizRateWidgetElementsType,
  SliderWidgetElementsType,
  TalkAboutElementsType, EmojiReactionWidgetElemetsType,
} from '../../types';
import { WidgetsTypes } from '../../types';
import {
  ChooseAnswerWidget,
  ClickMeWidget,
  EmojiReactionWidget,
  GiphyWidget,
  QuestionWidget,
  SliderWidget,
  SwipeUpWidget,
  TalkAboutWidget,
  TextWidget,
  TimerWidget,
  FigureWidget,
  QuizMultipleAnswerWidget,
  QuizMultipleAnswerWithImageWidget,
  QuizOneAnswerWidget,
  QuizOpenAnswerWidget,
  QuizRateWidget,
} from '../../widgets';

interface WidgetFactoryProps {
  storyId: string;
  widget: WidgetObjectType;
}

export class WidgetFactory extends React.Component<WidgetFactoryProps> {
  private makeWidget() {
    switch (this.props.widget.content.type) {
      case WidgetsTypes.CHOOSE_ANSWER:
        return (
          <ChooseAnswerWidget
            elementsSize={this.props.widget.editorElementsSize as ChooseAnswerWidgetElemetsType}
            params={this.props.widget.content.params}
            position={this.props.widget.position}
            positionLimits={this.props.widget.positionLimits}
            widgetId={this.props.widget.id}
          />
        );
      case WidgetsTypes.CLICK_ME:
        return (
          <ClickMeWidget
            params={this.props.widget.content.params}
            widgetId={this.props.widget.id}
            widgetImage={this.props.widget.content.widgetImage}
          />
        );
      case WidgetsTypes.ELLIPSE:
        return (
          <FigureWidget
            params={this.props.widget.content.params}
            type="ellipse"
          />
        );
      case WidgetsTypes.EMOJI_REACTION:
        return (
          <EmojiReactionWidget
            elementsSize={this.props.widget.editorElementsSize as EmojiReactionWidgetElemetsType}
            params={this.props.widget.content.params}
            position={this.props.widget.position}
            positionLimits={this.props.widget.positionLimits}
            widgetId={this.props.widget.id}
          />
        );
      case WidgetsTypes.GIPHY:
        return <GiphyWidget params={this.props.widget.content.params} />;
      case WidgetsTypes.QUESTION:
        return (
          <QuestionWidget
            elementsSize={this.props.widget.editorElementsSize as QuestionWidgetElementsType}
            params={this.props.widget.content.params}
            position={this.props.widget.position}
            positionLimits={this.props.widget.positionLimits}
            widgetId={this.props.widget.id}
          />
        );
      case WidgetsTypes.RECTANGLE:
        return (
          <FigureWidget
            params={this.props.widget.content.params}
            type="rectangle"
          />
        );
      case WidgetsTypes.SLIDER:
        return (
          <SliderWidget
            elementsSize={this.props.widget.editorElementsSize as SliderWidgetElementsType}
            params={this.props.widget.content.params}
            position={this.props.widget.position}
            positionLimits={this.props.widget.positionLimits}
            widgetId={this.props.widget.id}
          />
        );
      case WidgetsTypes.SWIPE_UP:
        return (
          <SwipeUpWidget
            params={this.props.widget.content.params}
            widgetImage={this.props.widget.content.widgetImage}
            widgetId={this.props.widget.id}
          />
        );
      case WidgetsTypes.TALK_ABOUT:
        return (
          <TalkAboutWidget
            elementsSize={this.props.widget.editorElementsSize as TalkAboutElementsType}
            params={this.props.widget.content.params}
            position={this.props.widget.position}
            positionLimits={this.props.widget.positionLimits}
            widgetId={this.props.widget.id}
          />
        );
      case WidgetsTypes.TEXT:
        return (
          <TextWidget
            params={this.props.widget.content.params}
            widgetImage={this.props.widget.widgetImage}
            position={this.props.widget.position}
            positionLimits={this.props.widget.positionLimits}
          />
        );
      case WidgetsTypes.TIMER:
        return <TimerWidget params={this.props.widget.content.params} />;
      case WidgetsTypes.QUIZ_ONE_ANSWER:
        return (
          <QuizOneAnswerWidget
            elementsSize={this.props.widget.editorElementsSize as QuizOneAnswerWidgetElementsType}
            widgetId={this.props.widget.id}
            params={this.props.widget.content.params}
            position={this.props.widget.position}
            positionLimits={this.props.widget.positionLimits}
          />
        );
      case WidgetsTypes.QUIZ_MULTIPLE_ANSWERS:
        return (
          <QuizMultipleAnswerWidget
            elementsSize={this.props.widget.editorElementsSize as QuizMultipleAnswerWidgetElementsType}
            widgetId={this.props.widget.id}
            params={this.props.widget.content.params}
            position={this.props.widget.position}
            positionLimits={this.props.widget.positionLimits}
          />
        );
      case WidgetsTypes.QUIZ_MULTIPLE_ANSWER_WITH_IMAGE:
        return (
          <QuizMultipleAnswerWithImageWidget
            elementsSize={
              this.props.widget.editorElementsSize as QuizMultipleAnswerWidgetWithImageElementsType
            }
            widgetId={this.props.widget.id}
            params={this.props.widget.content.params}
            position={this.props.widget.position}
            positionLimits={this.props.widget.positionLimits}
          />
        );
      case WidgetsTypes.QUIZ_OPEN_ANSWER:
        return (
          <QuizOpenAnswerWidget
            elementsSize={this.props.widget.editorElementsSize as QuizOpenAnswerWidgetElementsType}
            widgetId={this.props.widget.id}
            params={this.props.widget.content.params}
            position={this.props.widget.position}
            positionLimits={this.props.widget.positionLimits}
          />
        );
      case WidgetsTypes.QUIZ_RATE:
        return (
          <QuizRateWidget
            elementsSize={this.props.widget.editorElementsSize as QuizRateWidgetElementsType}
            widgetId={this.props.widget.id}
            params={this.props.widget.content.params}
            position={this.props.widget.position}
            positionLimits={this.props.widget.positionLimits}
          />
        );
      default:
        return undefined;
    }
  }

  render() {
    return <>{this.makeWidget()}</>;
  }
}
