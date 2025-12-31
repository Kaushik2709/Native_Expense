import { View, Text } from 'react-native'
import React from 'react'
import Navbar from '../components/Navbar'
import { SafeAreaView } from 'react-native-safe-area-context'

const split = () => {
  return (
    <SafeAreaView className='px-4'>
      <Navbar/>
      <Text>Split</Text>
    </SafeAreaView>
  )
}

export default split