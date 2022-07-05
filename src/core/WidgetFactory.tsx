import React from 'react';
import type { WidgetObjectType } from '../types';
import { WidgetsTypes } from '../types';
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
} from '../widgets';

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
            widgetImage={this.props.widget.content.widgetImage}
          />
        );
      case WidgetsTypes.TIMER:
        return <TimerWidget params={this.props.widget.content.params} />;
      default:
        return undefined;
    }
  }

  render() {
    return <>{this.makeWidget()}</>;
  }
}
