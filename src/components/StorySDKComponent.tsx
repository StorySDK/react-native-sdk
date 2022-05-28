import * as React from 'react';
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
  locale?: string,
) {
  let app: AppType;
  let groups: GroupType[];

  axios.defaults.baseURL = 'https://api.storysdk.com/api/v1';
  axios.defaults.headers.common = { Authorization: `SDK ${token}` };

  const appsResponse = await axios({
    method: 'get',
    url: '/apps',
  });

  app = {
    id: appsResponse.data.data[0].id,
    settings: {
      groupView: appsResponse.data.data[0].settings.groupView.react,
    },
    localization: appsResponse.data.data[0].localization,
  };
  const groupsResponse = await axios({
    method: 'get',
    url: `/apps/${app.id}/groups`,
  });

  const lang = locale ? locale : app.localization.default;

  groups = groupsResponse.data.data.map(({ id, title, image_url }: any) => ({
    id,
    title: title[lang],
    imageUrl: image_url[lang],
    stories: [],
  }));

  for (let group of groups) {
    const storiesResponse = await axios({
      method: 'get',
      url: `/apps/${app.id}/groups/${group.id}/stories`,
    });

    group.stories = storiesResponse.data.data.map((story: any) => ({
      id: story.id,
      storyData: adaptWidgets(
        story.story_data[lang].widgets,
        story.id,
        group.id,
        uniqUserId,
        token,
        locale ? locale : app.localization.default,
      ),
      background: story.story_data[lang].background,
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
    axios.defaults.baseURL = 'https://api.diffapp.link/api/v1';
    axios.defaults.headers.common = { Authorization: `SDK ${token}` };

    fetchAppData(token, DeviceInfo.getDeviceId(), locale).then((response) => {
      setApp(response.app);
      setGroups(response.groups);
    });
  }, [locale, token]);

  return <GroupsList groups={groups} style={app?.settings.groupView} />;
};

export default StorySDKComponent;
