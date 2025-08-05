/*
  # Add Return Time and Analytics Support

  1. Schema Changes
    - Add `return_datetime` column to leave_requests
    - Add `approved_return_datetime` column for admin modifications
    - Add `department` column for better analytics grouping
    - Clear existing data for fresh start

  2. New Indexes
    - Add indexes for analytics queries
    - Optimize for date-based filtering

  3. Security
    - Maintain existing RLS policies
*/

-- Clear existing data
TRUNCATE TABLE check_logs CASCADE;
TRUNCATE TABLE leave_requests CASCADE;

-- Add new columns to leave_requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leave_requests' AND column_name = 'return_datetime'
  ) THEN
    ALTER TABLE leave_requests ADD COLUMN return_datetime timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leave_requests' AND column_name = 'approved_return_datetime'
  ) THEN
    ALTER TABLE leave_requests ADD COLUMN approved_return_datetime timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leave_requests' AND column_name = 'department'
  ) THEN
    ALTER TABLE leave_requests ADD COLUMN department text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leave_requests' AND column_name = 'admin_notes'
  ) THEN
    ALTER TABLE leave_requests ADD COLUMN admin_notes text;
  END IF;
END $$;

-- Add indexes for analytics
CREATE INDEX IF NOT EXISTS idx_leave_requests_department ON leave_requests(department);
CREATE INDEX IF NOT EXISTS idx_leave_requests_submitted_date ON leave_requests(DATE(submitted_at));
CREATE INDEX IF NOT EXISTS idx_check_logs_timestamp_date ON check_logs(DATE(timestamp));

-- Update the status check constraint to be more flexible
ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS leave_requests_status_check;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_status_check 
  CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Returned'));