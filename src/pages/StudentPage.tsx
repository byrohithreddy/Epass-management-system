import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Upload, Check, Clock, X, User, ArrowRight } from 'lucide-react';
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
    department: '',
    leave_datetime: '',
    return_datetime: '',
    description: '',
    file: null as File | null,
  });

  const handleScanResult = async (scannedId: string) => {
    console.log('Scan result received:', scannedId);
    
    try {
      setStudentId(scannedId);
      setMessage(`Student ID scanned: ${scannedId}`);
      
      // Fetch existing leave requests for this student
      await fetchLeaveRequests(scannedId);
      
      // Show the form and status
      setShowForm(true);
      setShowStatus(true);
      
      // Clear the message after a few seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error processing scan result:', error);
      setMessage('Error processing scan result. Please try again.');
    }
  };

  const fetchLeaveRequests = async (id: string) => {
    try {
      console.log('Fetching leave requests for student:', id);
      
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('student_id', id)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Leave requests fetched:', data);
      setLeaveRequests(data || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      setMessage('Error loading previous requests.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      console.log('Submitting leave request for:', studentId);
      
      // Validate return time is after leave time
      if (formData.return_datetime && formData.leave_datetime) {
        const leaveTime = new Date(formData.leave_datetime);
        const returnTime = new Date(formData.return_datetime);
        
        if (returnTime <= leaveTime) {
          setMessage('Return time must be after leave time.');
          setLoading(false);
          return;
        }
      }
      
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
          department: formData.department,
          leave_datetime: formData.leave_datetime,
          return_datetime: formData.return_datetime || null,
          description: formData.description,
          file_url: fileUrl || null,
        });

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      setMessage('Gatepass submitted successfully! Please visit the admin office for faster approval.');
      setFormData({ 
        section: '', 
        department: '',
        leave_datetime: '', 
        return_datetime: '',
        description: '', 
        file: null 
      });
      await fetchLeaveRequests(studentId);
    } catch (error) {
      console.error('Error submitting gatepass:', error);
      setMessage('Error submitting gatepass request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStudentId('');
    setShowForm(false);
    setShowStatus(false);
    setLeaveRequests([]);
    setMessage('');
    setFormData({ 
      section: '', 
      department: '',
      leave_datetime: '', 
      return_datetime: '',
      description: '', 
      file: null 
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Check className="h-5 w-5 text-green-600" />;
      case 'Rejected':
        return <X className="h-5 w-5 text-red-600" />;
      case 'Returned':
        return <ArrowRight className="h-5 w-5 text-blue-600" />;
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
      case 'Returned':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    }
  };

  const departments = [
    'Computer Science Engineering',
    'Electronics & Communication Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Information Technology',
    'Chemical Engineering',
    'Biotechnology',
    'Aerospace Engineering',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Apply for Gatepass</h1>
          <p className="text-gray-600">Scan your student ID to get started</p>
        </div>

        {/* Global message display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.includes('Error') 
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-green-50 border-green-200 text-green-700'
          }`}>
            <div className="flex items-center space-x-2">
              {message.includes('Error') ? (
                <X className="h-5 w-5" />
              ) : (
                <Check className="h-5 w-5" />
              )}
              <span>{message}</span>
            </div>
          </div>
        )}

        {!showForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <button
              onClick={() => setShowScanner(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center space-x-2 shadow-md hover:shadow-lg"
            >
              <Calendar className="h-5 w-5" />
              <span>Start Gatepass Request</span>
            </button>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> You can also enter your Student ID manually if scanning doesn't work.
              </p>
            </div>
          </div>
        )}

        {showForm && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Gatepass Request Form</h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowScanner(true)}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <User className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section
                    </label>
                    <input
                      type="text"
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., CSE-A, ECE-B"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      Expected Return Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.return_datetime}
                      onChange={(e) => setFormData({ ...formData, return_datetime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Admin may modify this time</p>
                  </div>
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
                    placeholder="Reason for leave..."
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
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </form>
            </div>

            {showStatus && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Gatepass Status</h2>
                
                {leaveRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No gatepass requests found</p>
                    <p className="text-gray-400 text-sm mt-2">Submit your first request using the form</p>
                  </div>
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
                        <p className="text-xs">Section: {request.section} | Dept: {request.department}</p>
                        
                        {request.return_datetime && (
                          <div className="mt-2 text-xs">
                            <span className="font-medium">Expected Return:</span> {new Date(request.return_datetime).toLocaleString()}
                            {request.approved_return_datetime && (
                              <div className="text-blue-600 mt-1">
                                <span className="font-medium">Admin Approved Return:</span> {new Date(request.approved_return_datetime).toLocaleString()}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {request.admin_notes && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                            <span className="font-medium">Admin Notes:</span> {request.admin_notes}
                          </div>
                        )}
                        
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