import React, { useState } from 'react';
import { Shield, UserCheck, CheckCircle, Camera, User, AlertCircle } from 'lucide-react';
import BarcodeScanner from '../components/BarcodeScanner';
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Guard Station</h1>
          <p className="text-gray-600">Scan Student ID to Validate Gatepass</p>
        </div>

        {/* Global message display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.includes('Error') || message.includes('No approved')
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-green-50 text-green-700 border-green-200'
          }`}>
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
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Camera className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <div className="space-y-4">
              <button
                onClick={() => setShowScanner(true)}
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                <UserCheck className="h-5 w-5" />
                <span>{loading ? 'Validating...' : 'Scan Student ID'}</span>
              </button>
              
              <p className="text-gray-500 text-sm">
                Position the student's ID barcode in front of the camera
              </p>
            </div>
          </div>
        )}

        {studentInfo && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Valid Gatepass Found</h2>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
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
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {studentInfo.status}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <p className="text-gray-900">{studentInfo.description}</p>
              </div>
            </div>

            <div className="flex space-x-4">
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
          </div>
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