import * as React from 'react';

import { StyleSheet, View, Text, TextInput, Button, Image } from 'react-native';
import Stories, { GroupItemProps } from '@storysdk/react-native-sdk';

function customGroupItem(props: GroupItemProps) {
  return (
    <View style={{ marginRight: 20 }}>
      <Image
        source={{ uri: props.imageUrl }}
        style={{ width: 100, height: 100, borderRadius: 10, marginBottom: 8 }}
      />
      <Text
        style={{
          fontFamily: 'Inter-Bold',
          color: '#333333',
          fontSize: 14,
        }}
      >
        {props.title}
      </Text>
    </View>
  );
}

export default function App() {
  const [token, setToken] = React.useState(
    'b881fa22-ef23-41f2-92a6-efb04b147834'
  );

  const [reloadTimestamp, setReloadTimestamp] = React.useState(0);

  return (
    <View style={styles.container}>
      <Stories token={token} reload={reloadTimestamp} />
      <View style={styles.field}>
        <Text style={styles.label}>Token</Text>
        <TextInput style={styles.input} onChangeText={setToken} value={token} />
      </View>
      <View style={styles.field}>
        <Button
          title="Reload data"
          onPress={() => setReloadTimestamp(new Date().getTime())}
        />
      </View>
      <View style={styles.block}>
        <Text style={styles.title}>Custom groups view</Text>
        <Stories
          token={token}
          reload={reloadTimestamp}
          renderGroupItem={customGroupItem}
        />
      </View>
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
    fontFamily: 'Inter-Regular',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#cecece',
    borderRadius: 4,
    padding: 10,
    fontFamily: 'Inter-Regular',
  },
  block: {
    marginBottom: 20,
    borderTopWidth: 2,
    borderTopColor: '#f3f3f3',
  },
  title: {
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    fontSize: 18,
    color: '#343434',
    marginBottom: 10,
    marginTop: 4,
  },
});
