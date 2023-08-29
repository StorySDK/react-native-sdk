import axios from 'axios';
import { Platform } from 'react-native';
import type { AppType, GroupType, StoryType } from '../types';

class Service {
  async fetchApp(): Promise<AppType> {
    const appsResponse = await axios.get('/app');

    return {
      id: appsResponse.data.data.id,
      settings: {
        groupView: appsResponse.data.data.settings.groupView[Platform.OS],
      },
      localization: appsResponse.data.data.localization,
    };
  }

  async fetchGroups(): Promise<GroupType[]> {
    const groupsResponse = await axios.get('/groups');
    console.log(groupsResponse.data.data[0].settings)
    return groupsResponse.data.data.map(({ id, title, image_url, settings }: any) => ({
      id,
      title: title,
      imageUrl: image_url,
      settings: settings,
      stories: [],
    }));
  }

  async fetchStoriesByGroupId(groupId: string): Promise<StoryType[]> {
    const storiesResponse = await axios.get(`/groups/${groupId}/stories`);
    return storiesResponse.data.data.map((story: any) => ({
      id: story.id,
      storyData: story.story_data.widgets,
      layerData: story.layer_data,
      startTime: story.story_data.start_time || null,
      endTime: story.story_data.end_time || null,
      background: story.story_data.background,
      positionIndex: story.position,
    }));
  }

  async fetchGroupStories(groups: GroupType[]): Promise<GroupType[]> {
    for (let group of groups) {
      group.stories = await this.fetchStoriesByGroupId(group.id);
    }

    return groups;
  }
}

export default new Service();
