import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://cfyfeewbitawephfqzpg.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_Ok4Q7_UEW5d9vj04wSUF_A_C5yzR90w";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

