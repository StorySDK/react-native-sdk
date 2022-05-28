import * as React from 'react';

import { StyleSheet, View, Text, TextInput } from 'react-native';
import { StorySDKComponent } from '@storysdk/react-native-sdk';

export default function App() {
  const [token, setToken] = React.useState(
    'b881fa22-ef23-41f2-92a6-efb04b147834'
  );

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>Token</Text>
        <TextInput style={styles.input} onChangeText={setToken} value={token} />
      </View>
      <StorySDKComponent token={token} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#cecece',
    borderRadius: 4,
    padding: 10,
  },
});
