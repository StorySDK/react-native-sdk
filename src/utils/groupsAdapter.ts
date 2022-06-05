import axios from 'axios';

const actionToWidget = (
  widget: any,
  storyId: string,
  groupId: string,
  uniqUserId: string,
  token: string,
  locale: string
) => {
  switch (widget.content.type) {
    case 'choose_answer':
      return (answer: string) =>
        axios({
          method: 'post',
          url: 'https://api.diffapp.link/api/v1/reactions',
          data: {
            type: 'answer',
            group_id: groupId,
            story_id: storyId,
            widget_id: widget.id,
            user_id: uniqUserId,
            value: answer,
            locale,
          },
          headers: { Authorization: `SDK ${token}` },
        }).then(({ data: { data } }: any) => data);
    case 'emoji_reaction':
      return (emoji: string) =>
        axios({
          method: 'post',
          url: 'https://api.diffapp.link/api/v1/reactions',
          data: {
            type: 'answer',
            group_id: groupId,
            story_id: storyId,
            widget_id: widget.id,
            user_id: uniqUserId,
            value: emoji,
            locale,
          },
          headers: { Authorization: `SDK ${token}` },
        }).then(({ data: { data } }: any) => data);
    case 'talk_about':
      return (answer: string) =>
        axios({
          method: 'post',
          url: 'https://api.diffapp.link/api/v1/reactions',
          data: {
            type: 'answer',
            group_id: groupId,
            story_id: storyId,
            widget_id: widget.id,
            user_id: uniqUserId,
            value: answer,
            locale,
          },
          headers: { Authorization: `SDK ${token}` },
        }).then(({ data: { data } }: any) => data);
    case 'click_me':
      return (url: string) =>
        axios({
          method: 'post',
          url: 'https://api.diffapp.link/api/v1/reactions',
          data: {
            type: 'click',
            group_id: groupId,
            story_id: storyId,
            widget_id: widget.id,
            user_id: uniqUserId,
            value: url,
            locale,
          },
          headers: { Authorization: `SDK ${token}` },
        }).then(({ data: { data } }: any) => data);
    case 'question':
      return (answer: string) =>
        axios({
          method: 'post',
          url: 'https://api.diffapp.link/api/v1/reactions',
          data: {
            type: 'answer',
            group_id: groupId,
            story_id: storyId,
            widget_id: widget.id,
            user_id: uniqUserId,
            value: answer,
            locale,
          },
          headers: { Authorization: `SDK ${token}` },
        }).then(({ data: { data } }: any) => data);
    case 'slider':
      return (value: number) =>
        axios({
          method: 'post',
          url: 'https://api.diffapp.link/api/v1/reactions',
          data: {
            type: 'answer',
            group_id: groupId,
            story_id: storyId,
            widget_id: widget.id,
            user_id: uniqUserId,
            value: value,
            locale,
          },
          headers: { Authorization: `SDK ${token}` },
        }).then(({ data: { data } }: any) => data);
    case 'swipe_up':
      return (url: string) => {
        axios({
          method: 'post',
          url: 'https://api.diffapp.link/api/v1/reactions',
          data: {
            type: 'click',
            group_id: groupId,
            story_id: storyId,
            widget_id: widget.id,
            user_id: uniqUserId,
            locale,
            value: url || '',
          },
          headers: { Authorization: `SDK ${token}` },
        }).then(({ data: { data } }: any) => data);
      };
    default:
      return undefined;
  }
};

export const adaptWidgets = (
  widgets: any,
  storyId: string,
  groupId: string,
  uniqUserId: string,
  token: string,
  locale: string
) =>
  widgets.map((widget: any) => ({
    ...widget,
    action: actionToWidget(widget, storyId, groupId, uniqUserId, token, locale),
  }));
