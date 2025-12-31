# Supabase Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication with Supabase in your React Native Expo app.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Google Cloud Platform account with OAuth credentials

## Step 1: Configure Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Enable **Google** provider
4. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
5. Add authorized redirect URLs:
   - For development: `nativeexpense://`
   - For production: Your production URL scheme

## Step 2: Get Supabase Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following:
   - **Project URL** (this is your `SUPABASE_URL`)
   - **anon/public key** (this is your `SUPABASE_ANON_KEY`)

## Step 3: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API**
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure OAuth consent screen if prompted
6. Create credentials for:
   - **Application type**: Web application
   - **Authorized redirect URIs**: 
     - `https://[your-project-ref].supabase.co/auth/v1/callback`
     - `nativeexpense://`
7. Copy the **Client ID** and **Client Secret**

## Step 4: Set Environment Variables

### Option 1: Using app.json (Recommended for Expo)

Edit `app.json` and add your Supabase credentials:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://your-project-ref.supabase.co",
      "supabaseAnonKey": "your-anon-key-here"
    }
  }
}
```

### Option 2: Using .env file

Create a `.env` file in the `Expense_Frontend` directory:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Note**: Make sure to add `.env` to your `.gitignore` file to keep your credentials secure!

## Step 5: Install Dependencies

The required dependencies are already installed:
- `@supabase/supabase-js`
- `expo-auth-session`
- `expo-web-browser`
- `@react-native-async-storage/async-storage`

## Step 6: Test the Integration

1. Start your Expo app: `npm start`
2. Navigate to the Profile tab
3. Click "Sign in with Google"
4. Complete the OAuth flow
5. You should see your profile information after successful authentication

## Troubleshooting

### OAuth redirect not working
- Make sure the redirect URL in Supabase matches your app's scheme (`nativeexpense://`)
- Verify the redirect URL is added in Google Cloud Console

### "Missing Supabase environment variables" warning
- Check that you've added the credentials to `app.json` or `.env` file
- Restart your Expo development server after adding environment variables

### Session not persisting
- Ensure `@react-native-async-storage/async-storage` is properly installed
- Check that AsyncStorage is working on your device/emulator

## Files Created/Modified

- `lib/supabase.ts` - Supabase client configuration
- `contexts/AuthContext.tsx` - Authentication context and provider
- `app/_layout.tsx` - Root layout with AuthProvider
- `app/(tabs)/profile.tsx` - Profile page with login/logout UI
- `app.json` - Added environment variables configuration

## Security Notes

- Never commit your Supabase service role key to version control
- Use the anon/public key for client-side operations
- The service role key should only be used in your backend server
- Consider implementing Row Level Security (RLS) policies in Supabase for data protection

