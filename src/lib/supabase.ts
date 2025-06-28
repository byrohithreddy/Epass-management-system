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
  department?: string;
  leave_datetime: string;
  return_datetime?: string;
  approved_return_datetime?: string;
  description: string;
  file_url?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Returned';
  submitted_at: string;
  admin_notes?: string;
};

export type CheckLog = {
  id: string;
  student_id: string;
  leave_id: string;
  timestamp: string;
  action: string;
};

export type AnalyticsData = {
  totalRequests: number;
  todayRequests: number;
  weekRequests: number;
  statusBreakdown: {
    pending: number;
    approved: number;
    rejected: number;
    returned: number;
  };
  departmentStats: Array<{
    department: string;
    count: number;
  }>;
  dailyTrends: Array<{
    date: string;
    count: number;
  }>;
  topApplicants: Array<{
    student_id: string;
    count: number;
    department?: string;
  }>;
  checkoutStats: {
    today: number;
    week: number;
    total: number;
  };
  pendingAging: {
    overOneDay: number;
    overTwoDays: number;
  };
};
