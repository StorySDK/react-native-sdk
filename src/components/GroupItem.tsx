import * as React from 'react';
import { StyleSheet, Image, Text, View } from 'react-native';
import type { GroupItemProps } from '../types';

const GroupItem: React.FC<GroupItemProps> = ({
  imageUrl,
  title,
  style,
  active,
}) => {
  return (
    <View style={[styles.container, themed.container[style]]}>
      <View
        style={[
          styles.frame,
          themed.frame[style],
          active && styles.frame_active,
        ]}
      >
        <Image
          style={[styles.img, themed.img[style]]}
          source={{ uri: imageUrl }}
        />
      </View>
      <View style={[styles.textWrapper, themed.textWrapper[style]]}>
        <Text style={[styles.title, themed.title[style]]}>{title}</Text>
      </View>
    </View>
  );
};

const themed = {
  container: {
    circle: {},
    square: {},
    bigSquare: {},
    rectangle: {},
  },
  frame: {
    circle: {
      width: 68,
      height: 68,
      borderRadius: 50,
    },
    square: {
      width: 68,
      height: 68,
      borderRadius: 10,
    },
    bigSquare: {
      width: 86,
      height: 86,
      borderRadius: 10,
    },
    rectangle: {
      width: 68,
      height: 86,
      borderRadius: 10,
    },
  },
  img: {
    circle: {
      width: 60,
      height: 60,
      borderRadius: 50,
    },
    square: {
      width: 60,
      height: 60,
      borderRadius: 7,
    },
    bigSquare: {
      width: 78,
      height: 78,
      borderRadius: 7,
    },
    rectangle: {
      width: 60,
      height: 78,
      borderRadius: 7,
    },
  },
  textWrapper: {
    circle: {},
    square: {},
    bigSquare: {
      position: 'absolute',
      bottom: 10,
      left: 10,
      width: 68,
    },
    rectangle: {
      position: 'absolute',
      bottom: 10,
      left: 10,
      width: 50,
    },
  },
  title: {
    circle: {},
    square: {},
    bigSquare: {
      color: '#FFFFFF',
    },
    rectangle: {
      color: '#FFFFFF',
      fontSize: 8,
    },
  },
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 20,
  },
  textWrapper: {},
  title: {
    flexShrink: 1,
    fontFamily: 'Inter-Bold',
    fontWeight: 'bold',
    fontSize: 10,
    color: '#2b1e2a',
    marginTop: 6,
  },
  title_active: {},
  img: {
    margin: 0,
    padding: 0,
    flex: 1,
    resizeMode: 'cover',
  },
  frame: {
    padding: 2,
    borderWidth: 2,
    borderColor: '#e9e6e9',
  },
  frame_active: {
    borderColor: '#fd19cc',
  },
});

export default GroupItem;
