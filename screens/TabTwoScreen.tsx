import * as React from 'react';
import { StyleSheet } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

import { Text, View } from '../components/Themed';

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
    
      <View style={styles.root}>
        <View style={styles.iconContainer}>
         <MaterialCommunityIcons name="file-outline" size={24} color="grey" />
         </View>
         <View style={{ flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.title}>Title</Text>
          <Text style={styles.time}>2d</Text>
         </View>
    </View>
  </View>
  );  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  root: {
    flexDirection: 'row',
    width: '100%',
    padding: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: '#404040',
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    marginRight: 5,

  },
  time: {
    color: 'darkgrey'
  },
});
