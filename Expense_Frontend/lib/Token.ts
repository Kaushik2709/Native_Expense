import { supabase } from "@/lib/supabase";
import { Platform } from 'react-native';

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
  
  const baseURL = Platform.OS === 'web' ? 'http://localhost:5000' : 'http://10.158.248.202:5000';
  
  await fetch(`${baseURL}/api/user`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
