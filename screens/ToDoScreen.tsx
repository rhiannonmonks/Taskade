import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  TextInput, 
  KeyboardAvoidingView,
  Platform,
  Alert,
 } from 'react-native';
import { useQuery, gql } from '@apollo/client';
import { useRoute } from '@react-navigation/native';
import ToDoItem from '../components/ToDoItem';

import { Text, View } from '../components/Themed';

const GET_PROJECT = gql `
query getTaskList($id:ID!) {
  getTaskList(id:$id) {
    id
    title
    createdAt
    todos {
      id
      content
      isCompleted
    }
  }
}`

let id = '4';

export default function ToDoScreen() {

  const [project, setProject] = useState(null);
  const [ title, setTitle ] = useState('');

  const route = useRoute();

  const { data, error, loading } = useQuery(GET_PROJECT, { variables: { id: route.params.id } })

  useEffect(() => {
    if (error) {
      console.log(error);
      Alert.alert('Error fetching projects', error.message)
    }
  }, [error])

  useEffect(() => {
    if (data) {
      setProject(data.getTaskList);
      setTitle(data.getTaskList.title);
    }
  }, [data])

  const createNewItem = (atIndex: number) => {
    // const newTodos = [ ...todos];
    // newTodos.splice(atIndex, 0, {
    //   id: id,
    //   content: '',
    //   isCompleted: false
    // })
    // setTodos(newTodos);
  }

  if (!project) {
    return null;
  }

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 130 : 0}
        style={{ flex: 1}}
    >
      <View style={styles.container}>
      <TextInput 
        value={title}
        onChangeText={setTitle}
        placeholder={'Title'}
        style={styles.title} />
      <FlatList 
        data={project.todos}
        renderItem={({ item, index }) => (
        <ToDoItem 
        todo={item} 
        onSubmit={() => createNewItem(index + 1)} 
        />
        )}
        style={{width: '100%'}}
      />
    </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  title: {
    width: '100%',
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 12,
  }, 
});
