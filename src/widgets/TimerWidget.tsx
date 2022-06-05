import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { TimerWidgetParamsType } from '../types';

interface Props {
  params: TimerWidgetParamsType;
}

const calculateTime = (time: number) => {
  const days = Math.floor(time / (1000 * 60 * 60 * 24));
  const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((time / 1000 / 60) % 60);

  return {
    days: days < 10 ? `0${days}` : `${days}`,
    hours: hours < 10 ? `0${hours}` : `${hours}`,
    minutes: minutes < 10 ? `0${minutes}` : `${minutes}`,
  };
};

export const TimerWidget: React.FC<Props> = ({ params }) => {
  const [time, setTime] = React.useState(
    calculateTime(params.time + 60000 - new Date().getTime())
  );

  React.useEffect(() => {
    setTimeout(() => {
      setTime(calculateTime(params.time - new Date().getTime()));
    }, 1000);
  });

  return (
    <View style={[styles.container]}>
      <Text style={styles.title}>{params.text}</Text>
      <View style={styles.dial}>
        <View style={styles.col}>
          <View style={styles.digitRow}>
            <View style={styles.digit}>
              <Text style={styles.digitText}>{time.days[0]}</Text>
            </View>
            <View style={styles.digit}>
              <Text style={styles.digitText}>{time.days[1]}</Text>
            </View>
          </View>
          <Text style={styles.caption}>Days</Text>
        </View>
        <View style={styles.col}>
          <View style={styles.digitRow}>
            <View style={styles.digit}>
              <Text style={styles.digitText}>{time.hours[0]}</Text>
            </View>
            <View style={styles.digit}>
              <Text style={styles.digitText}>{time.hours[1]}</Text>
            </View>
          </View>
          <Text style={styles.caption}>Hours</Text>
        </View>
        <View style={styles.col}>
          <View style={styles.digitRow}>
            <View style={styles.digit}>
              <Text style={styles.digitText}>{time.minutes[0]}</Text>
            </View>
            <View style={styles.digit}>
              <Text style={styles.digitText}>{time.minutes[1]}</Text>
            </View>
          </View>
          <Text style={styles.caption}>Minutes</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    lineHeight: 19,
    marginBottom: 8,
    fontWeight: '500',
    color: '#05051d',
    textAlign: 'left',
  },
  dial: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: { display: 'flex', flexDirection: 'column' },
  digitRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 48,
  },
  digit: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 22,
    height: 36,
    borderRadius: 4,
    backgroundColor: 'rgba(5, 5, 29, 0.15)',
  },
  digitText: { color: '#05051d', fontSize: 16, fontWeight: '500' },
  divider: {},
  caption: {
    marginTop: 2,
    fontSize: 8,
    lineHeight: 8,
    fontWeight: '500',
    color: '#05051d',
  },
});
