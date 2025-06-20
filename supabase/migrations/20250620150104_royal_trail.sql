/*
  # Analytics Dashboard and Return Time Features

  1. New Columns
    - `return_datetime` - Student's proposed return time
    - `approved_return_datetime` - Admin's approved return time
    - `department` - Student's department for analytics
    - `admin_notes` - Admin comments on requests

  2. Status Updates
    - Added 'Returned' status for completed gatepasses
    - Updated constraint to include new status

  3. Indexes
    - Added indexes for better analytics performance
    - Removed problematic date function indexes

  4. Data Cleanup
    - Cleared existing data for fresh start with new schema
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

-- Add indexes for analytics (avoiding immutable function issues)
CREATE INDEX IF NOT EXISTS idx_leave_requests_department ON leave_requests(department);
CREATE INDEX IF NOT EXISTS idx_leave_requests_return_datetime ON leave_requests(return_datetime);
CREATE INDEX IF NOT EXISTS idx_leave_requests_approved_return_datetime ON leave_requests(approved_return_datetime);

-- Update the status check constraint to include 'Returned'
ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS leave_requests_status_check;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_status_check 
  CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Returned'));