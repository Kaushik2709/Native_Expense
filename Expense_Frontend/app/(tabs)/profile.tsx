import { View, Text, Pressable, Image, ActivityIndicator, Alert, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import Navbar from '../components/Navbar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../contexts/AuthContext'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { LinearGradient } from 'expo-linear-gradient'

interface MenuItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  iconBgColor?: string;
  iconColor?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  iconBgColor = 'bg-gray-100',
  iconColor = '#6b7280'
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className="flex-row items-center py-4 border-b border-gray-100"
  >
    <View className={`w-10 h-10 rounded-xl ${iconBgColor} items-center justify-center mr-4`}>
      <MaterialIcons name={icon} size={22} color={iconColor} />
    </View>
    <View className="flex-1">
      <Text className="text-gray-800 font-semibold text-base">{title}</Text>
      {subtitle && <Text className="text-gray-400 text-xs mt-0.5">{subtitle}</Text>}
    </View>
    {showChevron && (
      <MaterialIcons name="chevron-right" size={24} color="#d1d5db" />
    )}
  </TouchableOpacity>
);

const Profile = () => {
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
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign out');
            }
          }
        }
      ]
    );
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

        <ScrollView
          showsVerticalScrollIndicator={false}
        >
          {user ? (
            <>
              {/* Profile Header Card */}
              <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-gray-100">
                <View className="flex-row items-center">
                  {/* Avatar with gradient border */}
                  <View className="mr-4">
                    {user.user_metadata?.avatar_url ? (
                      <View className="w-20 h-20 rounded-full bg-purple-100 p-0.5">
                        <Image
                          source={{ uri: user.user_metadata.avatar_url }}
                          className='w-full h-full rounded-full'
                        />
                      </View>
                    ) : (
                      <View className='w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 items-center justify-center'>
                        <Text className="text-white text-3xl font-bold">
                          {(user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* User Info */}
                  <View className="flex-1">
                    <Text className='text-xl font-bold text-gray-900'>
                      {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                    </Text>
                    <Text className='text-gray-500 text-sm mt-1'>
                      {user.email}
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <View className="bg-green-100 px-2 py-0.5 rounded-full">
                        <Text className="text-green-700 text-xs font-medium">Verified</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Quick Stats */}
              <View className="flex-row mb-6 gap-3">
                <View className="flex-1 bg-purple-500 rounded-2xl p-4">
                  <MaterialIcons name="account-balance-wallet" size={24} color="rgba(255,255,255,0.8)" />
                  <Text className="text-white text-2xl font-bold mt-2">$2,450</Text>
                  <Text className="text-purple-200 text-xs">Total Balance</Text>
                </View>
                <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100">
                  <MaterialIcons name="trending-up" size={24} color="#22c55e" />
                  <Text className="text-gray-900 text-2xl font-bold mt-2">23</Text>
                  <Text className="text-gray-400 text-xs">Transactions</Text>
                </View>
              </View>

              {/* Menu Section */}
              <View className="bg-white rounded-3xl px-4 mb-6 shadow-sm border border-gray-100">
                <MenuItem
                  icon="person-outline"
                  title="Edit Profile"
                  subtitle="Update your personal info"
                  iconBgColor="bg-blue-50"
                  iconColor="#3b82f6"
                />
                <MenuItem
                  icon="notifications-none"
                  title="Notifications"
                  subtitle="Manage alerts and reminders"
                  iconBgColor="bg-amber-50"
                  iconColor="#f59e0b"
                />
                <MenuItem
                  icon="lock-outline"
                  title="Privacy & Security"
                  subtitle="Password, 2FA, data"
                  iconBgColor="bg-green-50"
                  iconColor="#22c55e"
                />
                <MenuItem
                  icon="credit-card"
                  title="Payment Methods"
                  subtitle="Cards and bank accounts"
                  iconBgColor="bg-purple-50"
                  iconColor="#7B61FF"
                />
              </View>

              {/* Support Section */}
              <View className="bg-white rounded-3xl px-4 mb-6 shadow-sm border border-gray-100">
                <MenuItem
                  icon="help-outline"
                  title="Help & Support"
                  iconBgColor="bg-cyan-50"
                  iconColor="#06b6d4"
                />
                <MenuItem
                  icon="info-outline"
                  title="About"
                  subtitle="Version 1.0.0"
                  iconBgColor="bg-gray-100"
                  iconColor="#6b7280"
                  showChevron={false}
                />
              </View>

              {/* Sign Out Button */}
              <TouchableOpacity
                onPress={handleSignOut}
                activeOpacity={0.8}
                className='bg-red-50 border border-red-100 py-4 rounded-2xl items-center flex-row justify-center'
              >
                <MaterialIcons name="logout" size={20} color="#ef4444" style={{ marginRight: 8 }} />
                <Text className='text-red-500 font-semibold text-base'>Sign Out</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* Not Signed In View */
            <View className='flex-1 justify-center items-center py-20'>
              {/* Decorative Background */}
              <View className="absolute top-0 left-0 right-0 h-64 bg-purple-50 rounded-b-[60px]" />

              <View className='items-center w-full relative'>
                {/* Animated Avatar Placeholder */}
                <View className='w-28 h-28 rounded-full bg-white items-center justify-center mb-6 shadow-xl border-4 border-purple-100'>
                  <MaterialIcons name="person" size={56} color="#7B61FF" />
                </View>

                <Text className='text-3xl font-bold text-gray-900 mb-2'>
                  Welcome Back!
                </Text>
                <Text className='text-gray-500 mb-10 text-center px-8 leading-6'>
                  Sign in to track your expenses, split bills with friends, and take control of your finances.
                </Text>

                {/* Sign In Button */}
                <TouchableOpacity
                  onPress={handleSignIn}
                  disabled={signingIn}
                  activeOpacity={0.9}
                  className='bg-white px-8 py-4 rounded-2xl w-full max-w-xs items-center flex-row justify-center shadow-lg border border-gray-100'
                >
                  {signingIn ? (
                    <ActivityIndicator size="small" color="#7B61FF" />
                  ) : (
                    <>
                      <Image
                        source={{ uri: 'https://www.google.com/favicon.ico' }}
                        className="w-5 h-5 mr-3"
                      />
                      <Text className='text-gray-800 font-semibold text-base'>Continue with Google</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Terms */}
                <Text className="text-gray-400 text-xs text-center mt-6 px-8">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

export default Profile