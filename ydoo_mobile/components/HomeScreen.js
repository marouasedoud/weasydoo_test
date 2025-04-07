import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen() {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <Text>Hello world</Text>
      <Button onPress={() => setCount(count + 1)} title="click me" />
      <Text>You clicked {count} times</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
