import { supabase } from "@/lib/supabase";
import { Platform } from 'react-native';
import BaseURL from "./BaseURL";
// Note: This function is deprecated. Use useAuth hook from AuthContext instead
export async function callBackend() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (!session) {
    console.error("❌ No active session");
    return;
  }

  const accessToken = session.access_token;




  await fetch(`${BaseURL()}/api/user`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
