import DeviceInfo from 'react-native-device-info';
import axios from 'axios';

class Reactions {
  private groupId: string = '';
  private storyId: string = '';
  private widgetId: string = '';
  private readonly userId: string = '';

  constructor() {
    this.userId = DeviceInfo.getDeviceId();
  }

  public registerGroup(groupId: string) {
    this.groupId = groupId;
  }

  public registerStory(storyId: string) {
    this.storyId = storyId;
  }

  public registerWidget(widgetId: string) {
    this.widgetId = widgetId;
  }

  public send(type: string, value?: string | number) {
    return axios
      .post('/reactions', {
        type: type,
        value: value || '',
        group_id: this.groupId,
        story_id: this.storyId,
        widget_id: this.widgetId,
        user_id: this.userId,
        locale: 'en',
      })
      .then(({ data: { data } }) => data);
  }
}

export default new Reactions();
