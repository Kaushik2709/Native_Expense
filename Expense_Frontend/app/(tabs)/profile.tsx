import { View, Text, Pressable, Image, ActivityIndicator, Alert } from 'react-native'
import React from 'react'
import Navbar from '../components/Navbar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../contexts/AuthContext'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useEffect } from "react";
import { callBackend } from "@/lib/Token";
const profile = () => {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [signingIn, setSigningIn] = React.useState(false);
  


  const handleSignIn = async () => {
    try {
      setSigningIn(true);
      await signInWithGoogle();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign in with Google';
      console.error('Sign in error:', error);
      Alert.alert(
        'Authentication Error', 
        errorMessage + '\n\nIf you see "redirect_uri_mismatch", check EXPO_GO_OAUTH_SETUP.md for instructions.',
        [{ text: 'OK' }]
      );
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      Alert.alert('Success', 'Signed out successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign out');
    }
  };

  if (loading) {
    return (
      <SafeAreaView className='flex-1 bg-gray-50 justify-center items-center'>
        <ActivityIndicator size="large" color="#7B61FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      <View className='px-4 flex-1'>
        <Navbar title="Profile" />
        
        <View className='flex-1 justify-center items-center'>
          {user ? (
            <View className='items-center w-full'>
              {/* User Avatar */}
              {user.user_metadata?.avatar_url ? (
                <Image
                  source={{ uri: user.user_metadata.avatar_url }}
                  className='w-24 h-24 rounded-full mb-4'
                />
              ) : (
                <View className='w-24 h-24 rounded-full bg-purple-500 items-center justify-center mb-4'>
                  <MaterialIcons name="person" size={48} color="#FFFFFF" />
                </View>
              )}

              {/* User Name */}
              <Text className='text-2xl font-bold text-gray-800 mb-2'>
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
              </Text>

              {/* User Email */}
              <Text className='text-gray-600 mb-8'>
                {user.email}
              </Text>

              {/* Sign Out Button */}
              <Pressable
                onPress={handleSignOut}
                className='bg-red-500 px-8 py-4 rounded-full w-full max-w-xs items-center'
              >
                <Text className='text-white font-semibold text-lg'>Sign Out</Text>
              </Pressable>
            </View>
          ) : (
            <View className='items-center w-full'>
              {/* Welcome Message */}
              <View className='w-24 h-24 rounded-full bg-purple-100 items-center justify-center mb-6'>
                <MaterialIcons name="person" size={48} color="#7B61FF" />
              </View>

              <Text className='text-2xl font-bold text-gray-800 mb-2'>
                Welcome!
              </Text>
              <Text className='text-gray-600 mb-8 text-center px-4'>
                Sign in with Google to access your expense data
              </Text>

              {/* Sign In Button */}
              <Pressable
                onPress={handleSignIn}
                disabled={signingIn}
                className='bg-white px-8 py-4 rounded-full w-full max-w-xs items-center flex-row justify-center shadow-lg border border-gray-200'
              >
                {signingIn ? (
                  <ActivityIndicator size="small" color="#7B61FF" />
                ) : (
                  <>
                    <MaterialIcons name="login" size={24} color="#7B61FF" style={{ marginRight: 8 }} />
                    <Text className='text-purple-600 font-semibold text-lg'>Sign in with Google</Text>
                  </>
                )}
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

export default profile