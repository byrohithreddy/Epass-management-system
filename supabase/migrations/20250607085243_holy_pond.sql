/*
  # Leave Management System Schema

  1. New Tables
    - `leave_requests`
      - `id` (uuid, primary key)
      - `student_id` (text)
      - `section` (text) 
      - `leave_datetime` (timestamp)
      - `description` (text)
      - `file_url` (text, optional)
      - `status` (text: "Pending", "Approved", "Rejected")
      - `submitted_at` (timestamp)
    
    - `check_logs`
      - `id` (uuid, primary key)
      - `student_id` (text)
      - `leave_id` (foreign key to leave_requests.id)
      - `timestamp` (timestamp)
      - `action` (text: "Checked Out")

  2. Security
    - Enable RLS on both tables
    - Add policies for students (public access)
    - Add policies for admins (authenticated access)
    - Add policies for guards (public read access)
*/

-- Create leave_requests table
CREATE TABLE IF NOT EXISTS leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text NOT NULL,
  section text NOT NULL,
  leave_datetime timestamptz NOT NULL,
  description text NOT NULL,
  file_url text,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  submitted_at timestamptz DEFAULT now()
);

-- Create check_logs table
CREATE TABLE IF NOT EXISTS check_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text NOT NULL,
  leave_id uuid REFERENCES leave_requests(id),
  timestamp timestamptz DEFAULT now(),
  action text NOT NULL DEFAULT 'Checked Out'
);

-- Enable RLS
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leave_requests
CREATE POLICY "Students can insert their own leave requests"
  ON leave_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read leave requests"
  ON leave_requests
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Admins can update leave status"
  ON leave_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for check_logs
CREATE POLICY "Guards can insert check logs"
  ON check_logs
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read check logs"
  ON check_logs
  FOR SELECT
  TO anon
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leave_requests_student_id ON leave_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_leave_datetime ON leave_requests(leave_datetime);
CREATE INDEX IF NOT EXISTS idx_check_logs_student_id ON check_logs(student_id);