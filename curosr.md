Expense_Frontend/lib/supabase.ts — NEW
Supabase client configuration
Platform-specific storage (localStorage for web, AsyncStorage for native)
Reads credentials from app.json
Expense_Frontend/contexts/AuthContext.tsx — NEW
Authentication context/provider
Google OAuth sign-in logic
Deep link handling for OAuth callbacks
Expo Go redirect URL detection
Expense_Frontend/app/_layout.tsx — NEW
Root layout wrapping app with AuthProvider
Expense_Frontend/SUPABASE_SETUP.md — NEW
General setup guide
Expense_Frontend/EXPO_GO_OAUTH_SETUP.md — NEW
Expo Go OAuth troubleshooting guide
Files modified
Expense_Frontend/app/(tabs)/profile.tsx — MODIFIED
Added Google OAuth login/logout UI
User profile display
Error handling
Expense_Frontend/app.json — MODIFIED
Added extra section with Supabase credentials:
     "extra": {       "supabaseUrl": "https://prnthftnmdneakrifcpa.supabase.co",       "supabaseAnonKey": "..."     }
Expense_Frontend/package.json — MODIFIED (via npm install)
Added @supabase/supabase-js dependency
Summary
Created: 5 files
Modified: 3 files
Total: 8 files changed
All changes are in the Expense_Frontend directory. No backend changes were made.