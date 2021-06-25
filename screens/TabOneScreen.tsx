import React, { useState } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import ToDoItem from '../components/ToDoItem';

import { Text, View } from '../components/Themed';

export default function TabOneScreen() {

  const [ todos, setTodos ] = useState([{
    id: '1',
    content: 'Buy milk',
    isCompleted: true,
  }, {
    id: '1',
    content: 'Buy cereal',
    isCompleted: false,
  }, {
    id: '3',
    content: 'Pour milk',
    isCompleted: false,
  }]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One two three</Text>
      <FlatList 
        data={todos}
        renderItem={({ item }) => <ToDoItem todo={item} />}
        style={{width: '100%'}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  }, 
});
