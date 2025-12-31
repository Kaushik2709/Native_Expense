import { supabase } from "@/lib/supabase";

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
  console.log(accessToken);
  
  await fetch("http://localhost:5000/api/user", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
