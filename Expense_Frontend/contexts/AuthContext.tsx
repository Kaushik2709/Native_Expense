import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';

// Complete the OAuth session in the browser
WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session retrieved:', session ? 'exists' : 'null');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session ? 'session exists' : 'no session');
      // Only update state if we're not in the middle of signing out
      // SIGNED_OUT event means we successfully signed out
      if (event === 'SIGNED_OUT' || !session) {
        setSession(null);
        setUser(null);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    // Helper function to extract params from hash or query string
    const extractParams = (urlString: string) => {
      const hashIndex = urlString.indexOf('#');
      const queryIndex = urlString.indexOf('?');
      
      let paramsString = '';
      if (hashIndex !== -1) {
        // Tokens are in hash fragment
        paramsString = urlString.substring(hashIndex + 1);
      } else if (queryIndex !== -1) {
        // Tokens are in query string
        paramsString = urlString.substring(queryIndex + 1);
      } else {
        return null;
      }
      
      // Parse the params string
      const params = new URLSearchParams(paramsString);
      return {
        access_token: params.get('access_token'),
        refresh_token: params.get('refresh_token'),
        error_description: params.get('error_description'),
      };
    };

    // Handle deep links for OAuth callback
    const handleDeepLink = async (urlString: string) => {
      try {
        console.log('Handling deep link');
        
        // Check if this looks like an OAuth callback
        const hasHash = urlString.includes('#');
        const hasQuery = urlString.includes('?');
        
        if (!hasHash && !hasQuery) {
          // Not an OAuth callback, just a regular deep link
          console.log('Deep link received but no OAuth params (hash or query) found - likely not an OAuth callback');
          return;
        }
        
        const params = extractParams(urlString);
        
        if (!params) {
          console.log('No params found in deep link after extraction');
          return;
        }

        const { access_token, refresh_token, error_description } = params;

        if (error_description) {
          console.error('OAuth error from deep link:', error_description);
          // Check if this is a navigation error (not a real OAuth error)
          // Navigation errors can appear in error_description during redirects
          if (error_description.includes('navigation') || error_description.includes('context')) {
            console.warn('Navigation error detected in OAuth callback, attempting to continue...');
            // If we have tokens, try to use them anyway
            if (access_token && refresh_token) {
              // Continue with token processing
            } else {
              // No tokens, this is a real error
              return;
            }
          } else {
            // Real OAuth error, return early
            return;
          }
        }

        if (access_token && refresh_token) {
          console.log('Setting session with tokens from deep link');
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          
          if (error) {
            console.error('Error setting session:', error);
          } else {
            console.log('Session set successfully from deep link');
          }
        } else {
          console.log('No tokens found in deep link', { access_token: !!access_token, refresh_token: !!refresh_token });
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
      }
    };

    // Get initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for deep links
    const linkingSubscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      linkingSubscription.remove();
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      // Get the correct redirect URL based on the environment
      let redirectUrl: string;
      
      // Check if we're in Expo Go
      if (Constants.appOwnership === 'expo') {
        // For Expo Go, use the full hostUri with port (matches what deep link receives)
        if (Constants.expoConfig?.hostUri) {
          // hostUri format: "10.88.56.202:8081"
          redirectUrl = `exp://${Constants.expoConfig.hostUri}`;
        } else if (Constants.linkingUri) {
          // Fallback: use linkingUri
          redirectUrl = Constants.linkingUri;
        } else {
          // Last resort: use Linking.createURL
          redirectUrl = Linking.createURL('/');
        }
      } else {
        // For standalone apps, use the custom scheme
        redirectUrl = Linking.createURL('/');
      }
  
      console.log('Using redirect URL:', redirectUrl);
      console.log('App ownership:', Constants.appOwnership);
      console.log('Host URI:', Constants.expoConfig?.hostUri);
      console.log('Linking URI:', Constants.linkingUri);
  
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        },
      });
  
      if (error) throw error;
  
      // Open the OAuth URL in browser
      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        
        console.log('OAuth result:', result.type);
        
        if (result.type === 'success') {
          // Parse the URL to extract tokens
          const resultUrl = 'url' in result ? result.url : null;
          if (!resultUrl) {
            throw new Error('No URL in OAuth result');
          }
          
          
          // Extract params from hash or query string
          const hashIndex = resultUrl.indexOf('#');
          const queryIndex = resultUrl.indexOf('?');
          
          let paramsString = '';
          if (hashIndex !== -1) {
            // Tokens are in hash fragment (common for OAuth)
            paramsString = resultUrl.substring(hashIndex + 1);
          } else if (queryIndex !== -1) {
            // Tokens are in query string
            paramsString = resultUrl.substring(queryIndex + 1);
          } else {
            throw new Error('No tokens found in OAuth result URL');
          }
          
          const params = new URLSearchParams(paramsString);
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');
          const error_description = params.get('error_description');

          if (error_description) {
            throw new Error(error_description);
          }

          if (access_token && refresh_token) {
            console.log('Setting session with tokens from OAuth result');
            const { error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            
            if (sessionError) throw sessionError;
            console.log('Session set successfully from OAuth result');
          } else {
            console.log('Missing tokens', { access_token: !!access_token, refresh_token: !!refresh_token });
            throw new Error('No access token or refresh token received');
          }
        } else if (result.type === 'cancel') {
          throw new Error('Authentication cancelled');
        } else if (result.type === 'dismiss') {
          throw new Error('Authentication dismissed');
        }
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      
      // Clear session state immediately (optimistic update)
      setSession(null);
      setUser(null);
      setLoading(false);
      
      // Try to sign out from Supabase - this should clear the session from storage
      try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.warn('Supabase signOut returned error:', error.message);
        } else {
          console.log('Successfully signed out from Supabase');
        }
      } catch (supabaseError: any) {
        console.warn('Error calling supabase.auth.signOut():', supabaseError.message);
      }
      
      // Manually clear all Supabase auth storage keys as a fallback
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const allKeys = await AsyncStorage.getAllKeys();
        // Supabase stores auth tokens with keys like: sb-<project-ref>-auth-token
        const supabaseKeys = allKeys.filter((key: string) => 
          key.includes('supabase') || 
          key.includes('auth-token') ||
          key.startsWith('sb-')
        );
        
        if (supabaseKeys.length > 0) {
          console.log('Clearing Supabase storage keys:', supabaseKeys);
          await AsyncStorage.multiRemove(supabaseKeys);
        }
      } catch (storageError: any) {
        console.warn('Could not manually clear storage:', storageError.message);
      }
      
      // Force clear state again to ensure it's cleared
      setSession(null);
      setUser(null);
      setLoading(false);
      
      console.log('Sign out completed, state and storage cleared');
    } catch (error: any) {
      console.error('Error in sign out process:', error.message);
      // Always clear state even on unexpected errors
      setSession(null);
      setUser(null);
      setLoading(false);
      // Don't throw - we've successfully cleared the local state
    }
  };
  

  return (
    <AuthContext.Provider value={{ session, user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

