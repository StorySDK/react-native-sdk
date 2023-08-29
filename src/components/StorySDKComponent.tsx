import * as React from 'react';
import axios from 'axios';
import type { GroupType, AppType, GroupItemProps } from '../types';
import { LoadingStatus } from '../types';
import GroupsList from './GroupsList';
import Service from '../core/Service';
import StatusBarContext from '../core/StatusBarContext';

interface StorySDKComponentProps {
  token: string;
  locale?: string;
  reload?: number | string;
  scrollAfterAnimation?: boolean;
  renderGroupItem?(props: GroupItemProps): React.ReactNode;
}

const StorySDKComponent: React.FC<StorySDKComponentProps> = ({
  token,
  locale,
  reload,
  renderGroupItem,
  scrollAfterAnimation= true
}) => {
  const [app, setApp] = React.useState<AppType | null>(null);
  const [groups, setGroups] = React.useState<GroupType[]>([]);
  const [status, setStatus] = React.useState<LoadingStatus>(LoadingStatus.IDLE);

  const [backgroundColor, setBackgroundColor] = React.useState('#000')

  React.useEffect(() => {
    axios.defaults.baseURL = 'https://api.diffapp.link/sdk/v1';
    axios.defaults.headers.common = { Authorization: `SDK ${token}` };
  }, [token]);

  React.useEffect(() => {
    Service.fetchApp().then((loadedApp) => {
      setApp(loadedApp);
    });

    setStatus(LoadingStatus.PENDING);
    Service.fetchGroups().then((groupsResponse) => {
      setGroups(groupsResponse);
      setStatus(LoadingStatus.LOADED);

      Service.fetchGroupStories(groupsResponse).then((_groups) => {
        setGroups(_groups
          .map((group) => ({ ...group, stories: group.stories.filter((story) => {
            return (story.startTime ? Date.parse(story.startTime) < Date.now() : true)
            && (story.endTime ? Date.parse(story.endTime) > Date.now() : true)
          })}))
          .filter((group) => group.stories.length > 0)
        );
      });
    });
  }, [locale, token, reload]);

  return (
    <StatusBarContext.Provider value={{ backgroundColor, setBackgroundColor, scrollAfterAnimation }}>
      <GroupsList
        groups={groups}
        style={app?.settings.groupView}
        status={status}
        renderGroupItem={renderGroupItem}
      />
    </StatusBarContext.Provider>
  );
};

export default StorySDKComponent;
