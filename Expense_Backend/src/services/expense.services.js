import { createClient } from "@supabase/supabase-js";
import { supabase } from "../config/supabase.js";

const expenseServices = {
  createExpense: async (transaction) => {
    const { data, error } = await supabase
      .from("transactions")
      .insert([transaction])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
  getExpenses: async () => {
    const { data, error } = await supabase.from("transactions").select("*");
    if (error) throw new Error(error.message);
    return data;
  },
  getAllUsers: async () => {
    // Use Admin API to list all users (requires service role key)
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) throw new Error(error.message);
    return data;
  },
  
  getCurrentUser: async (req) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Missing or invalid Authorization header");
    }

    // ⚠️ CREATE CLIENT PER REQUEST
    const supabases = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    const { data, error } = await supabases.auth.getUser();
    console.log("ERROR:", error);

    if (error) throw error;
    if (!data.user) throw new Error("User not authenticated");

    return data?.user;
  },
  saveCurrentUser: async (req, res) => {
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          id: req.id,
          email: req.email,
          name: req.user_metadata.full_name,
        },
      ])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
};

export default expenseServices;
