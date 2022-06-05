import * as React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import type { GroupType } from '../types';
import StoryModal from './StoryModal';
import GroupItem from './GroupItem';
import Modal from 'react-native-modal';

interface GroupsListProps {
  groups: GroupType[];
  style?: 'circle' | 'square' | 'bigSquare' | 'rectangle';
}

const GroupsList = (props: GroupsListProps) => {
  const { groups, style = 'circle' } = props;
  const [viewed, setViewed] = React.useState<number[]>([]);

  const [currentGroup, setCurrentGroup] = React.useState(0);
  const [modalShow, setModalShow] = React.useState(false);

  const handleTap = (groupIndex: number) => () => {
    setCurrentGroup(groupIndex);
    setViewed([...viewed, groupIndex]);
    setModalShow(true);
  };

  const handlePreviewGroup = () => {
    if (currentGroup > 0) {
      setCurrentGroup(currentGroup - 1);
      setViewed([...viewed, currentGroup - 1]);
    }
  };

  const handleNextGroup = () => {
    if (currentGroup < groups.length - 1) {
      setCurrentGroup(currentGroup + 1);
      setViewed([...viewed, currentGroup + 1]);
    }
  };

  const handleCloseModal = () => {
    setModalShow(false);
  };

  const StoryModalMemo = React.memo(() => (
    <StoryModal
      stories={groups[currentGroup].stories}
      group={groups[currentGroup]}
      onClose={handleCloseModal}
      onNextGroup={handleNextGroup}
      onPreviewGroup={handlePreviewGroup}
      showed={modalShow}
      isFirstGroup={currentGroup === 0}
      isLastGroup={currentGroup === groups.length - 1}
    />
  ));

  return (
    <>
      <View style={styles.groups}>
        {groups.map((group, index) => (
          <Pressable
            key={group.id}
            style={styles.group}
            onPress={handleTap(index)}
          >
            <GroupItem
              title={group.title}
              imageUrl={group.imageUrl}
              active={!viewed.includes(index)}
              style={style}
            />
          </Pressable>
        ))}
      </View>
      <Modal
        isVisible={modalShow}
        style={styles.modal}
        onSwipeComplete={handleCloseModal}
        onBackButtonPress={handleCloseModal}
        backdropOpacity={1}
        statusBarTranslucent={false}
        swipeDirection="down"
      >
        <StoryModalMemo />
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
