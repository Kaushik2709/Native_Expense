# Expo Go OAuth Setup Guide

This guide will help you fix the OAuth redirect issue when using Expo Go.

## The Problem

When using Expo Go, after selecting a Google account, it redirects to `localhost:3001` and nothing works. This happens because Supabase doesn't know about your Expo Go redirect URL.

## Solution

### Step 1: Find Your Expo Go Redirect URL

When you run `expo start`, you'll see a URL like:
```
exp://192.168.1.100:8081
```

This is your Expo Go redirect URL. The format is: `exp://[YOUR_IP]:[PORT]`

**To find it:**
1. Run `expo start` in your terminal
2. Look for the line that says `Metro waiting on exp://...`
3. Copy that URL (without the port number at the end if present)

**Example:** If you see `exp://192.168.1.100:8081`, your redirect URL should be `exp://192.168.1.100`

### Step 2: Configure Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** > **URL Configuration**
4. Under **Redirect URLs**, add the following URLs:
   - `exp://192.168.1.100` (replace with your actual IP from Step 1)
   - `exp://localhost` (for local development)
   - `nativeexpense://` (for standalone apps)
   - `https://prnthftnmdneakrifcpa.supabase.co/auth/v1/callback` (Supabase callback - should already be there)

5. Click **Save**

### Step 3: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** > **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, add:
   - `https://prnthftnmdneakrifcpa.supabase.co/auth/v1/callback`
   - `exp://192.168.1.100` (replace with your actual IP)
   - `nativeexpense://`

6. Click **Save**

### Step 4: Restart Your App

1. Stop your Expo dev server (Ctrl+C)
2. Clear the cache: `npx expo start --clear`
3. Try signing in again

## Alternative: Use a Fixed Redirect URL

If your IP address changes frequently, you can:

1. Use a tunnel service like ngrok to get a fixed URL
2. Or use the custom scheme `nativeexpense://` (but this only works in standalone builds, not Expo Go)

## Troubleshooting

### Still redirecting to localhost:3001?

1. **Check Supabase redirect URLs**: Make sure you added the `exp://` URL exactly as shown in your terminal
2. **Check the console logs**: The app now logs the redirect URL being used. Check if it matches what you added to Supabase
3. **Clear Supabase cache**: Sometimes Supabase caches redirect URLs. Wait a few minutes after adding them
4. **Check network**: Make sure your device and computer are on the same network

### Getting "redirect_uri_mismatch" error?

- Make sure the redirect URL in Supabase matches exactly what's logged in the console
- The URL format should be `exp://[IP]` (no port, no path)

### OAuth opens but doesn't redirect back?

- Check that you added the redirect URL to both Supabase AND Google Cloud Console
- Make sure the URL scheme matches exactly (case-sensitive)

## Testing

After configuration:
1. Open the app in Expo Go
2. Go to Profile tab
3. Click "Sign in with Google"
4. Select your Google account
5. You should be redirected back to the app (not localhost)
6. Your profile should show your Google account info

## For Production (Standalone Apps)

When building a standalone app, use:
- Redirect URL: `nativeexpense://` (your custom scheme)
- Make sure this is added to both Supabase and Google Cloud Console

