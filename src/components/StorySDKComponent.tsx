import * as React from 'react';
import axios from 'axios';
import type { GroupType, AppType, GroupItemProps } from '../types';
import { LoadingStatus } from '../types';
import GroupsList from './GroupsList';
import Service from '../core/Service';

interface StorySDKComponentProps {
  token: string;
  locale?: string;
  reload?: number | string;
  renderGroupItem?(props: GroupItemProps): React.ReactNode;
}

const StorySDKComponent: React.FC<StorySDKComponentProps> = ({
  token,
  locale,
  reload,
  renderGroupItem,
}) => {
  const [app, setApp] = React.useState<AppType | null>(null);
  const [groups, setGroups] = React.useState<GroupType[]>([]);
  const [status, setStatus] = React.useState<LoadingStatus>(LoadingStatus.IDLE);

  React.useEffect(() => {
    axios.defaults.baseURL = 'https://api.storysdk.com/sdk/v1';
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
        setGroups(_groups);
        console.log(_groups);
      });
    });
  }, [locale, token, reload]);

  return (
    <GroupsList
      groups={groups}
      style={app?.settings.groupView}
      status={status}
      renderGroupItem={renderGroupItem}
    />
  );
};

export default StorySDKComponent;
