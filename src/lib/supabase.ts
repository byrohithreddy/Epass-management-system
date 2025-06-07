import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type LeaveRequest = {
  id: string;
  student_id: string;
  section: string;
  leave_datetime: string;
  description: string;
  file_url?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submitted_at: string;
};

export type CheckLog = {
  id: string;
  student_id: string;
  leave_id: string;
  timestamp: string;
  action: string;
};