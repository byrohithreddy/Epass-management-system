import React, { useState, useEffect } from 'react';
import { Shield, LogOut, Check, X, Calendar, User, BarChart3, Clock, Edit3, Save } from 'lucide-react';
import { supabase, LeaveRequest } from '../lib/supabase';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'analytics'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingRequest, setEditingRequest] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    approved_return_datetime: '',
    admin_notes: ''
  });

  useEffect(() => {
    if (isAuthenticated && currentView === 'dashboard') {
      fetchLeaveRequests();
    }
  }, [isAuthenticated, currentView]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setMessage('');

    // Hardcoded admin credentials
    const ADMIN_EMAIL = 'admin@gmail.com';
    const ADMIN_PASSWORD = 'admin@123';

    try {
      if (loginForm.email === ADMIN_EMAIL && loginForm.password === ADMIN_PASSWORD) {
        setIsAuthenticated(true);
        setMessage('Login successful!');
      } else {
        setMessage('Invalid email or password');
      }
    } catch (error: any) {
      setMessage('Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    setCurrentView('dashboard');
    setLeaveRequests([]);
    setLoginForm({ email: '', password: '' });
    setMessage('');
    setEditingRequest(null);
  };

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setLeaveRequests(data || []);
    } catch (error) {
      console.error('Error fetching gatepass requests:', error);
      setMessage('Error loading gatepass requests');
    } finally {
      setLoading(false);
    }
  };

  const updateLeaveStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      const updateData: any = { status };
      
      // If editing, include the additional fields
      if (editingRequest === id) {
        if (editForm.approved_return_datetime) {
          updateData.approved_return_datetime = editForm.approved_return_datetime;
        }
        if (editForm.admin_notes) {
          updateData.admin_notes = editForm.admin_notes;
        }
      }

      const { error } = await supabase
        .from('leave_requests')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      await fetchLeaveRequests();
      setMessage(`Gatepass request ${status.toLowerCase()} successfully!`);
      setEditingRequest(null);
      setEditForm({ approved_return_datetime: '', admin_notes: '' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating gatepass status:', error);
      setMessage('Error updating gatepass status');
    }
  };

  const startEditing = (request: LeaveRequest) => {
    setEditingRequest(request.id);
    setEditForm({
      approved_return_datetime: request.approved_return_datetime || request.return_datetime || '',
      admin_notes: request.admin_notes || ''
    });
  };

  const cancelEditing = () => {
    setEditingRequest(null);
    setEditForm({ approved_return_datetime: '', admin_notes: '' });
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'Approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'Returned':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
  };

  const getPendingDays = (submittedAt: string) => {
    const submitted = new Date(submittedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - submitted.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 border border-gray-100">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-600 mt-2">Access the E-Gatepass dashboard</p>
          </div>

          {message && (
            <div className={`mb-4 p-4 rounded-lg border ${
              message.includes('successful') 
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="admin@gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loginLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <p className="text-xs text-gray-600 text-center">
              <strong>Demo Credentials:</strong><br />
              Email: admin@gmail.com<br />
              Password: admin@123
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'analytics') {
    return <AnalyticsDashboard onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage E-Gatepass requests</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentView('analytics')}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.includes('Error') 
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-green-50 text-green-700 border-green-200'
          }`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading gatepass requests...</p>
            </div>
          ) : leaveRequests.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No gatepass requests to review</p>
              <p className="text-gray-400 text-sm mt-2">New requests will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Information
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Return Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaveRequests.map((request) => {
                    const pendingDays = getPendingDays(request.submitted_at);
                    const isEditing = editingRequest === request.id;
                    
                    return (
                      <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {request.student_id}
                              </div>
                              <div className="text-sm text-gray-500">
                                {request.section} | {request.department}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="font-medium mb-1">
                              {new Date(request.leave_datetime).toLocaleDateString()} at{' '}
                              {new Date(request.leave_datetime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <div className="text-gray-600 max-w-xs truncate">
                              {request.description}
                            </div>
                            <div className="text-xs text-gray-400 mt-1 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Submitted: {new Date(request.submitted_at).toLocaleDateString()}
                              {request.status === 'Pending' && pendingDays > 0 && (
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                  pendingDays > 2 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {pendingDays}d pending
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="datetime-local"
                                value={editForm.approved_return_datetime}
                                onChange={(e) => setEditForm({ ...editForm, approved_return_datetime: e.target.value })}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              />
                              <textarea
                                value={editForm.admin_notes}
                                onChange={(e) => setEditForm({ ...editForm, admin_notes: e.target.value })}
                                placeholder="Admin notes..."
                                rows={2}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          ) : (
                            <div className="text-sm">
                              {request.return_datetime && (
                                <div className="text-gray-600">
                                  <span className="font-medium">Expected:</span><br />
                                  {new Date(request.return_datetime).toLocaleString()}
                                </div>
                              )}
                              {request.approved_return_datetime && (
                                <div className="text-blue-600 mt-1">
                                  <span className="font-medium">Approved:</span><br />
                                  {new Date(request.approved_return_datetime).toLocaleString()}
                                </div>
                              )}
                              {request.admin_notes && (
                                <div className="text-gray-500 text-xs mt-1 p-2 bg-gray-50 rounded">
                                  {request.admin_notes}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(request.status)}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {request.status === 'Pending' ? (
                            <div className="flex flex-col space-y-2">
                              {!isEditing ? (
                                <>
                                  <button
                                    onClick={() => startEditing(request)}
                                    className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                  >
                                    <Edit3 className="h-3 w-3 mr-1" />
                                    Edit
                                  </button>
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => updateLeaveStatus(request.id, 'Approved')}
                                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                                    >
                                      <Check className="h-3 w-3 mr-1" />
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => updateLeaveStatus(request.id, 'Rejected')}
                                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                                    >
                                      <X className="h-3 w-3 mr-1" />
                                      Reject
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <div className="flex flex-col space-y-1">
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => updateLeaveStatus(request.id, 'Approved')}
                                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                                    >
                                      <Save className="h-3 w-3 mr-1" />
                                      Save & Approve
                                    </button>
                                    <button
                                      onClick={() => updateLeaveStatus(request.id, 'Rejected')}
                                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                                    >
                                      <X className="h-3 w-3 mr-1" />
                                      Reject
                                    </button>
                                  </div>
                                  <button
                                    onClick={cancelEditing}
                                    className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">
                              {request.status === 'Approved' ? '✅ Approved' : 
                               request.status === 'Rejected' ? '❌ Rejected' : '🔄 Returned'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}