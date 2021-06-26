import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import { useMutation, gql } from '@apollo/client';

const SIGN_UP_MUTATION = gql`
mutation signUp(
  $email: String!,
  $password: String!,
  $name: String!) {
    signUp(input: {
      email: $email,
      password: $password,
      name: $name
    }) {
      token
      user {
        id
				name
      }
    }
  }
`;

const SignUpScreen = () => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  const navigation = useNavigation();

  // mutation[0] : A function to trigger the mutation
  // mutation[1] : result object
  // { data, error, loading }
  const [signUp, { data, error, loading }] = useMutation(SIGN_UP_MUTATION);
  
  console.log(data)
  console.log(error)

  const onSubmit = () => {
    signUp({variables: { name, email, password }})
  }
  
  return (
    <View style={{ padding: 20 }}>
      <TextInput
      placeholder="rhiannon@gmail.com"
      value={name}
      onChangeText={setName}
      style={{
        color: 'white',
        fontSize: 18,
        width: '100%',
        marginVertical: 25,

      }}
      />

      <TextInput
      placeholder="rhiannon@gmail.com"
      value={email}
      onChangeText={setEmail}
      style={{
        color: 'white',
        fontSize: 18,
        width: '100%',
        marginVertical: 25,

      }}
      />

      <TextInput
      placeholder="password"
      value={password}
      onChangeText={setPassword}
      secureTextEntry
      style={{
        color: 'white',
        fontSize: 18,
        width: '100%',
        marginVertical: 25,
      }}
      />

      <Pressable 
       onPress={onSubmit} 
       style={{ backgroundColor: "#e33062",
       height: 50,
       borderRadius: 5,
       alignItems: 'center',
       flexDirection: 'row',
       justifyContent: 'center',
       marginTop: 30,
       }}
       >
      {loading && <ActivityIndicator /> }
      <Text style={{
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold' 
      }}>
        Sign Up
      </Text>
      </Pressable>

      <Pressable 
       disabled={loading}
       onPress={() => navigation.navigate('SignIn')} 
       style={{ 
       height: 50,
       borderRadius: 5,
       alignItems: 'center',
       justifyContent: 'center',
       marginTop: 30,
       }}
       >
      <Text style={{
        color: '#e33062',
        fontSize: 18,
        fontWeight: 'bold' 
      }}>
        Already Have an Account? Sign in
      </Text>
      </Pressable>
    </View>
  )
}

export default SignUpScreen
