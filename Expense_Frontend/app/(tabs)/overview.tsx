import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Navbar from '../components/Navbar'

const overview = () => {
  return (
    <SafeAreaView className='px-4'>
      <Navbar/>
      <Text>overview</Text>
    </SafeAreaView>
  )
}

export default overview