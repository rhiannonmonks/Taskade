import React, { useState, useEffect } from 'react'
import { View, TextInput } from 'react-native'
import Checkbox from '../Checkbox';

interface ToDoItemProps {
  todo: {
    id: string;
    content: string;
    isCompleted: boolean;
  }
}

const ToDoItem = ({ todo }: ToDoItemProps) => {
  const [isChecked, setIsChecked] = useState(false);
  const [ content, setContent ] = useState('');

  useEffect(() => {
    if (!todo) { return }

    setIsChecked(todo.isCompleted);
    setContent(todo.content);
  }, [todo])
  
  return (
   
  <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 3 }}>
    <Checkbox 
    isChecked={isChecked} 
    onPress={() => { setIsChecked(!isChecked) }} />
    
    <TextInput
    value={content}
    onChangeText={setContent}
    style={{
        flex: 1,
        fontSize: 18,
        color: 'white',
        marginLeft: 12,
        }}
        multiline 
        />
      </View>
  )
}

export default ToDoItem;
