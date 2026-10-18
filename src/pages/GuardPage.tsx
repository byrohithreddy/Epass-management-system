import React, { useState } from 'react';
import { UserCheck, CheckCircle, AlertCircle } from 'lucide-react';
import BarcodeScanner from '../components/BarcodeScanner';
import RequestRoute from '../components/RequestRoute';
import { supabase, LeaveRequest } from '../lib/supabase';

export default function GuardPage() {
  const [showScanner, setShowScanner] = useState(false);
  const [studentInfo, setStudentInfo] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleScanResult = async (scannedId: string) => {
    console.log('Guard scan result received:', scannedId);
    setLoading(true);
    setMessage('');
    setStudentInfo(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      console.log('Searching for approved leave for student:', scannedId, 'on date:', today);
      
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('student_id', scannedId)
        .eq('status', 'Approved')
        .gte('leave_datetime', today)
        .lte('leave_datetime', today + 'T23:59:59')
        .order('leave_datetime', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Query result:', data);

      if (data && data.length > 0) {
        setStudentInfo(data[0]);
        setMessage(`Valid gatepass found for student ${scannedId}`);
      } else {
        setMessage(`No approved gatepass found for student ${scannedId} today.`);
      }
    } catch (error) {
      console.error('Error fetching student gatepass:', error);
      setMessage('Error validating student gatepass. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!studentInfo) return;

    setLoading(true);
    setMessage('');

    try {
      console.log('Logging check-out for student:', studentInfo.student_id);
      
      const { error } = await supabase
        .from('check_logs')
        .insert({
          student_id: studentInfo.student_id,
          leave_id: studentInfo.id,
          action: 'Checked Out',
        });

      if (error) {
        console.error('Check-out error:', error);
        throw error;
      }

      setMessage('Check-out logged successfully.');
      setStudentInfo(null);
      
      // Clear message after a few seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error logging check-out:', error);
      setMessage('Error logging check-out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setStudentInfo(null);
    setMessage('');
  };

  return (
    <div className="page-view page-view--guard">
      <div className="page-container">
        <div className="page-heading">
          <div>
            <h1>Guard station</h1>
            <p>Scan a student ID to validate today's gatepass.</p>
          </div>
        </div>

        {/* Global message display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border status-banner ${
            message.includes('Error') || message.includes('No approved')
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-green-50 text-green-700 border-green-200'
          }`} role={message.includes('Error') || message.includes('No approved') ? 'alert' : 'status'} aria-live="polite">
            <div className="flex items-center space-x-2">
              {message.includes('Error') || message.includes('No approved') ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              <span>{message}</span>
            </div>
          </div>
        )}

        {!studentInfo && (
          <section className="guard-scan-panel">
            <div className="guard-scan-copy">
              <span className="campus-wordmark">Gate verification</span>
              <h2>Check a pass before departure.</h2>
              <p>Scan the barcode on the student's ID. If camera access is unavailable, enter the ID manually.</p>
            </div>
            <div className="guard-scan-action">
              <button
                onClick={() => setShowScanner(true)}
                disabled={loading}
                className="primary-action disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserCheck aria-hidden="true" size={19} strokeWidth={1.7} />
                <span>{loading ? 'Validating...' : 'Scan Student ID'}</span>
              </button>
              
              <p className="guard-scan-hint">The rear camera is selected when available.</p>
            </div>
          </section>
        )}

        {studentInfo && (
          <section className="surface-panel guard-pass-panel" aria-labelledby="verified-pass-title">
            <div className="panel-heading">
              <div>
                <span className="campus-wordmark">Gate verification</span>
                <h2 id="verified-pass-title">Valid gatepass found</h2>
              </div>
              <span className="request-status request-status--approved">
                <CheckCircle aria-hidden="true" size={17} />
                {studentInfo.status}
              </span>
            </div>

            <div className="panel-body guard-pass-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{studentInfo.student_id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{studentInfo.section}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leave Date & Time
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(studentInfo.leave_datetime).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span className="request-status request-status--approved">{studentInfo.status}</span>
                </div>
              </div>

              <div className="guard-pass-description">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <p className="text-gray-900">{studentInfo.description}</p>
              </div>
              <RequestRoute status={studentInfo.status} />
            </div>

            <div className="guard-pass-actions">
              <button
                onClick={handleCheckOut}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
              >
                <CheckCircle className="h-5 w-5" />
                <span>{loading ? 'Processing...' : 'Check-Out Student'}</span>
              </button>
              
              <button
                onClick={resetScanner}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                Scan Another
              </button>
            </div>
          </section>
        )}

        <BarcodeScanner
          isOpen={showScanner}
          onScanResult={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      </div>
    </div>
  );
}