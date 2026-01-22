import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Platform-specific storage adapter
const getStorage = () => {
  // For web, use localStorage
  if (Platform.OS === 'web') {
    return {
      getItem: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return Promise.resolve(window.localStorage.getItem(key));
        }
        return Promise.resolve(null);
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        return Promise.resolve();
      },
    };
  }
  
  // For native platforms, use AsyncStorage
  return AsyncStorage;
};

// Get Supabase URL and Anon Key from environment variables
// Try multiple ways to access the config for different platforms
const getConfigValue = (key: string): string => {
  // Try expo-constants config (works for native)
  if (Constants.expoConfig?.extra?.[key]) {
    return Constants.expoConfig.extra[key];
  }
  
  // Try manifest (works for web and older Expo versions)
  if (Constants.manifest?.extra?.[key]) {
    return Constants.manifest.extra[key];
  }
  
  // Try environment variables
  const envKey = `EXPO_PUBLIC_${key.toUpperCase()}`;
  const envValue = process.env[envKey];
  if (envValue) {
    return envValue;
  }
  
  // Fallback to hardcoded values (from app.json)
  const fallbackValues: Record<string, string> = {
    supabaseUrl: 'https://prnthftnmdneakrifcpa.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnRoZnRubWRuZWFrcmlmY3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg3MDAsImV4cCI6MjA3NTI0NDcwMH0.V3ij-ol-U462k7u2l5gqZ-f2hHyR3vmVV4tK5p0SxOo',
  };
  
  return fallbackValues[key] || '';
};

const supabaseUrl = getConfigValue('supabaseUrl');
const supabaseAnonKey = getConfigValue('supabaseAnonKey');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  throw new Error('Supabase configuration is missing. Please check your app.json or environment variables.');
}

const storage = getStorage();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

