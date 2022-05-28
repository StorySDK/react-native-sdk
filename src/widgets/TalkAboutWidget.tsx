import React from 'react';
import { StyleSheet, View, TextInput, Text } from 'react-native';
import type {
  TalkAboutWidgetParamsType,
  WidgetPositionLimitsType,
  WidgetPositionType,
} from '../types';

interface Props {
  params: TalkAboutWidgetParamsType;
  position: WidgetPositionType;
  positionLimits: WidgetPositionLimitsType;

  onAnswer?(): void;
}

export const TalkAboutWidget: React.FC<Props> = ({ params }) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{params.text}</Text>
        <TextInput style={styles.field} placeholder="Enter text..." />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
  },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    paddingTop: 30,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 14,
    lineHeight: 16.8,
    marginBottom: 15,
    fontWeight: '500',
    color: '#05051d',
    textAlign: 'center',
  },
  field: {
    width: '100%',
    height: 34,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(5,5,29,.15)',
    color: 'rgba(5,5,29,.6)',
    textAlign: 'center',
    fontSize: 10,
  },
  fieldText: {
    fontSize: 14,
    lineHeight: 16,
    color: '#05051d',
    textAlign: 'center',
  },
});
