import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Gracefully handle missing env vars — app shows a connection error instead of crashing
const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient("https://placeholder.supabase.co", "placeholder-anon-key");

export { isConfigured };

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "consultant" | "school";
  school_id: string | null;
  created_at: string;
};

export type School = {
  id: string;
  name: string;
  location: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  assigned_consultant_id: string | null;
  created_at: string;
};

export type Assessment = {
  id: string;
  school_id: string;
  assessor_id: string;
  assessment_date: string;
  status: "in_progress" | "completed";
  scores: Record<string, number>;
  overall_score: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
