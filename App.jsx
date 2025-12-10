import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';

const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to React Native 👋</Text>
      <Text style={styles.subtitle}>This is your basic App.js setup</Text>

      <Button
        title="Click Me"
        onPress={() => Alert.alert('Button Pressed!')}
      />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
});
