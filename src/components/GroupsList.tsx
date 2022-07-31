import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';
import CubeNavigation from './CubeNavigation';
import type { GroupType } from '../types';
import { GroupItemProps, LoadingStatus } from '../types';
import StoriesList from './StoriesList';
import Reactions from '../core/Reactions';
import GroupItem from './GroupItem';

interface GroupsListProps {
  groups: GroupType[];
  style?: 'circle' | 'square' | 'bigSquare' | 'rectangle';
  status?: LoadingStatus;
  renderGroupItem?(props: GroupItemProps): React.ReactNode;
}

const GroupsListSkeleton: React.FC = () => (
  <View style={skeleton.container}>
    <View style={skeleton.item} />
    <View style={skeleton.item} />
    <View style={skeleton.item} />
  </View>
);

const skeleton = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  item: {
    width: 68,
    height: 86,
    backgroundColor: '#f5f3f5',
    borderRadius: 10,
    marginRight: 20,
  },
});

const GroupsList = (props: GroupsListProps) => {
  const { groups, style = 'circle', status, renderGroupItem } = props;
  const [viewed, setViewed] = React.useState<number[]>([]);
  const [currentGroup, setCurrentGroup] = React.useState(0);
  const [modalShow, setModalShow] = React.useState(false);

  const handleTap = (groupIndex: number) => () => {
    setCurrentGroup(groupIndex);
    setViewed([...viewed, groupIndex]);
    setModalShow(true);
    Reactions.registerGroup(groups[groupIndex].id);
  };
  console.log('currentGroup', currentGroup);

  const handlePreviewGroup = () => {
    console.log('handlePreviewGroup', currentGroup);
    if (currentGroup > 0) {
      const prevIndex = currentGroup - 1;
      setCurrentGroup(prevIndex);
      setViewed([...viewed, prevIndex]);
    } else {
      handleCloseModal();
    }
  };

  const handleNextGroup = () => {
    if (currentGroup < groups.length - 1) {
      const nextIndex = currentGroup + 1;
      setCurrentGroup(nextIndex);
      setViewed([...viewed, nextIndex]);
    } else {
      handleCloseModal();
    }
  };

  const handleSwipe = (page: number) => {
    setCurrentGroup(page);
  };

  const handleCloseModal = () => {
    setModalShow(false);
  };

  return (
    <>
      <View style={styles.groups}>
        {status === LoadingStatus.LOADED ? (
          groups.map((group, index) => (
            <Pressable
              key={group.id}
              style={styles.group}
              onPress={handleTap(index)}
            >
              {renderGroupItem ? (
                renderGroupItem({
                  title: group.title,
                  imageUrl: group.imageUrl,
                  active: !viewed.includes(index),
                  style: style,
                })
              ) : (
                <GroupItem
                  title={group.title}
                  imageUrl={group.imageUrl}
                  active={!viewed.includes(index)}
                  style={style}
                />
              )}
            </Pressable>
          ))
        ) : (
          <GroupsListSkeleton />
        )}
      </View>
      <Modal
        isVisible={modalShow}
        style={styles.modal}
        onBackButtonPress={handleCloseModal}
        backdropOpacity={1}
        statusBarTranslucent={false}
        useNativeDriver
      >
        <CubeNavigation currentPage={currentGroup} onSwipe={handleSwipe}>
          {groups.map((group, i) => (
            <StoriesList
              key={group.id}
              group={group}
              isCurrentGroup={currentGroup === i}
              onClose={handleCloseModal}
              onNextGroup={handleNextGroup}
              onPreviewGroup={handlePreviewGroup}
              showed={modalShow}
            />
          ))}
        </CubeNavigation>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  groups: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'scroll',
  },
  group: {
    alignItems: 'center',
  },
  modal: {
    margin: 0,
    alignItems: undefined,
    justifyContent: undefined,
  },
});

export default GroupsList;
