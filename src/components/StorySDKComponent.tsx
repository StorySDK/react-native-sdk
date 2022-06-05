import * as React from 'react';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import type { GroupType } from '../types';
import GroupsList from './GroupsList';
import { adaptWidgets } from '../utils';

interface StorySDKComponentProps {
  token: string;
  locale?: string;
}

type AppType = {
  id: string;
  settings: {
    groupView: 'circle' | 'square' | 'bigSquare' | 'rectangle';
  };
  localization: {
    default: string;
    languages: string[];
  };
};

async function fetchAppData(
  token: string,
  uniqUserId: string,
  locale?: string
) {
  let app: AppType;
  let groups: GroupType[];

  axios.defaults.baseURL = 'https://api.storysdk.com/sdk/v1';
  axios.defaults.headers.common = { Authorization: `SDK ${token}` };

  const appsResponse = await axios.get('/app');

  app = {
    id: appsResponse.data.data.id,
    settings: {
      groupView: appsResponse.data.data.settings.groupView[Platform.OS],
    },
    localization: appsResponse.data.data.localization,
  };

  const groupsResponse = await axios.get('/groups');

  groups = groupsResponse.data.data.map(({ id, title, image_url }: any) => ({
    id,
    title: title,
    imageUrl: image_url,
    stories: [],
  }));

  for (let group of groups) {
    const storiesResponse = await axios.get(`/groups/${group.id}/stories`);
    console.log(storiesResponse.data.data);
    group.stories = storiesResponse.data.data.map((story: any) => ({
      id: story.id,
      storyData: adaptWidgets(
        story.story_data.widgets,
        story.id,
        group.id,
        uniqUserId,
        token,
        locale ? locale : app.localization.default
      ),
      background: story.story_data.background,
      positionIndex: story.position,
    }));
  }

  return {
    app,
    groups,
  };
}

const StorySDKComponent: React.FC<StorySDKComponentProps> = ({
  token,
  locale,
}) => {
  const [app, setApp] = React.useState<AppType | null>(null);
  const [groups, setGroups] = React.useState<GroupType[]>([]);

  React.useEffect(() => {
    axios.defaults.baseURL = 'https://api.storysdk.com/sdk/v1';
    axios.defaults.headers.common = { Authorization: `SDK ${token}` };

    fetchAppData(token, DeviceInfo.getDeviceId(), locale).then((response) => {
      setApp(response.app);
      setGroups(response.groups);
    });
  }, [locale, token]);

  return <GroupsList groups={groups} style={app?.settings.groupView} />;
};

export default StorySDKComponent;
