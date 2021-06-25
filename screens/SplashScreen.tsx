import React, { useEffect } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();
  
  useEffect(() => {
    if ( isAuthenticated()) {
      navigation.navigate('Home');
    } else {
      navigation.navigate('SignIn');
    }
  }, []);

  const isAuthenticated = () => {
    return false;
  }
  
  return (
    <View style={{flex: 1, justifyContent: 'center'}}>
      <ActivityIndicator />
    </View>
  )
}

export default SplashScreen
