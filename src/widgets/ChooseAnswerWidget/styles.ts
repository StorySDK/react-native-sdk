import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    backgroundColor: '#05051d',
    display: 'flex',
    justifyContent: 'center',
  },
  title: {
    textTransform: 'uppercase',
    color: '#ffffff',
    fontWeight: '500',
    textAlign: 'center',
  },
  answers: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: 12,
    paddingTop: 12,
    paddingRight: 12,
    paddingBottom: 6,
  },
});
