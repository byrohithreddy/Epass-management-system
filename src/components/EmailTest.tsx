import React, { useState } from 'react';
import { Mail, Check, X } from 'lucide-react';
import { sendLeaveRequestNotification } from '../lib/emailService';

export default function EmailTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [message, setMessage] = useState('');

  const testEmailNotification = async () => {
    setTesting(true);
    setResult(null);
    setMessage('');

    try {
      const testData = {
        student_id: 'TEST123',
        section: 'CSE-A',
        department: 'Computer Science Engineering',
        leave_datetime: new Date().toISOString(),
        return_datetime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
        description: 'This is a test gatepass request to verify email notifications are working.',
        submitted_at: new Date().toISOString(),
      };

      const success = await sendLeaveRequestNotification(testData);
      
      if (success) {
        setResult('success');
        setMessage('✅ Email notification sent successfully! Check mrcet9177@gmail.com');
      } else {
        setResult('error');
        setMessage('❌ Email notification failed. Check console for details.');
      }
    } catch (error) {
      console.error('Test email error:', error);
      setResult('error');
      setMessage('❌ Email test failed. Check console for error details.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Mail className="h-5 w-5 mr-2 text-blue-600" />
        Email Notification Test
      </h3>
      
      <p className="text-sm text-gray-600 mb-4">
        Test the email notification system by sending a test email to mrcet9177@gmail.com
      </p>

      <button
        onClick={testEmailNotification}
        disabled={testing}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
      >
        {testing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Testing...</span>
          </>
        ) : (
          <>
            <Mail className="h-4 w-4" />
            <span>Send Test Email</span>
          </>
        )}
      </button>

      {result && (
        <div className={`mt-4 p-3 rounded-lg border ${
          result === 'success' 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            {result === 'success' ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
            <span className="text-sm">{message}</span>
          </div>
        </div>
      )}
    </div>
  );
} 