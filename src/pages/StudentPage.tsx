import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Upload, Check, Clock, X } from 'lucide-react';
import BarcodeScanner from '../components/BarcodeScanner';
import { supabase, LeaveRequest } from '../lib/supabase';

export default function StudentPage() {
  const [showScanner, setShowScanner] = useState(false);
  const [studentId, setStudentId] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    section: '',
    leave_datetime: '',
    description: '',
    file: null as File | null,
  });

  const handleScanResult = async (scannedId: string) => {
    setStudentId(scannedId);
    await fetchLeaveRequests(scannedId);
    setShowForm(true);
    setShowStatus(true);
  };

  const fetchLeaveRequests = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('student_id', id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setLeaveRequests(data || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let fileUrl = '';
      
      if (formData.file) {
        const fileExt = formData.file.name.split('.').pop();
        const fileName = `${studentId}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('leave-documents')
          .upload(fileName, formData.file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
        } else {
          const { data } = await supabase.storage
            .from('leave-documents')
            .getPublicUrl(fileName);
          fileUrl = data.publicUrl;
        }
      }

      const { error } = await supabase
        .from('leave_requests')
        .insert({
          student_id: studentId,
          section: formData.section,
          leave_datetime: formData.leave_datetime,
          description: formData.description,
          file_url: fileUrl || null,
        });

      if (error) throw error;

      setMessage('Gatepass submitted. Please visit the admin office for faster approval.');
      setFormData({ section: '', leave_datetime: '', description: '', file: null });
      await fetchLeaveRequests(studentId);
    } catch (error) {
      console.error('Error submitting gatepass:', error);
      setMessage('Error submitting gatepass request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Check className="h-5 w-5 text-green-600" />;
      case 'Rejected':
        return <X className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'Rejected':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Apply for Gatepass</h1>
          <p className="text-gray-600">Scan your student ID to get started</p>
        </div>

        {!showForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <button
              onClick={() => setShowScanner(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <Calendar className="h-5 w-5" />
              <span>Start Gatepass Request</span>
            </button>
          </div>
        )}

        {showForm && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Gatepass Request Form</h2>
              
              {message && (
                <div className={`mb-4 p-4 rounded-lg border ${
                  message.includes('Error') 
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-green-50 border-green-200 text-green-700'
                }`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section
                  </label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leave Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.leave_datetime}
                    onChange={(e) => setFormData({ ...formData, leave_datetime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supporting Document (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <Upload className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </div>

            {showStatus && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Gatepass Status</h2>
                
                {leaveRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No gatepass requests found</p>
                ) : (
                  <div className="space-y-3">
                    {leaveRequests.map((request) => (
                      <div
                        key={request.id}
                        className={`p-4 rounded-lg border ${getStatusColor(request.status)}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(request.status)}
                            <span className="font-medium">{request.status}</span>
                          </div>
                          <span className="text-sm">
                            {new Date(request.leave_datetime).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm mb-1">{request.description}</p>
                        <p className="text-xs">Section: {request.section}</p>
                        
                        {request.status === 'Approved' && (
                          <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
                            <p className="text-green-800 font-medium text-sm">
                              ✅ Gatepass Approved. You may proceed to the gate.
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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