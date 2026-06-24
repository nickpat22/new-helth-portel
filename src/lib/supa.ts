import { supabase } from "./supabaseClient";

export { supabase };

export const ROLE_KEY: Record<string, string> = {
  Patient: "patient",
  Doctor: "doctor",
  "Laboratory Staff": "lab",
  "Medical Records Staff": "mrs",
};
export const ROLE_PREFIX: Record<string, string> = {
  Patient: "PAT",
  Doctor: "DOC",
  "Laboratory Staff": "LAB",
  "Medical Records Staff": "MRS",
};
export const ROLE_BADGE: Record<string, string> = {
  Patient: "#0A66C2",
  Doctor: "#0F6E56",
  "Laboratory Staff": "#BA7517",
  "Medical Records Staff": "#533AB7",
};

// Map display ID (PAT1001 / DOC1001 / ...) to the synthetic auth email used
// by Supabase Auth under the hood. Users never see this email.
export function idToEmail(displayId: string) {
  return `${displayId.trim().toLowerCase()}@documed.com`;
}

// Fetch the profile row for the currently signed-in auth user.
export async function fetchMyProfile() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth_user_id", auth.user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}
