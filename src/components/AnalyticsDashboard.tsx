import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Calendar,
  Building,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react';
import { supabase, AnalyticsData } from '../lib/supabase';

interface AnalyticsDashboardProps {
  onBack: () => void;
}

export default function AnalyticsDashboard({ onBack }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'all'>('all');

  useEffect(() => {
    fetchAnalytics();
  }, [dateFilter]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Total requests
      const { data: allRequests, error: allError } = await supabase
        .from('leave_requests')
        .select('*');

      if (allError) throw allError;

      // Today's requests
      const { data: todayRequests, error: todayError } = await supabase
        .from('leave_requests')
        .select('*')
        .gte('submitted_at', today.toISOString());

      if (todayError) throw todayError;

      // Week's requests
      const { data: weekRequests, error: weekError } = await supabase
        .from('leave_requests')
        .select('*')
        .gte('submitted_at', weekAgo.toISOString());

      if (weekError) throw weekError;

      // Status breakdown
      const statusBreakdown = {
        pending: allRequests?.filter(r => r.status === 'Pending').length || 0,
        approved: allRequests?.filter(r => r.status === 'Approved').length || 0,
        rejected: allRequests?.filter(r => r.status === 'Rejected').length || 0,
        returned: allRequests?.filter(r => r.status === 'Returned').length || 0,
      };

      // Department stats
      const deptMap = new Map();
      allRequests?.forEach(req => {
        if (req.department) {
          deptMap.set(req.department, (deptMap.get(req.department) || 0) + 1);
        }
      });
      const departmentStats = Array.from(deptMap.entries()).map(([department, count]) => ({
        department,
        count
      })).sort((a, b) => b.count - a.count);

      // Daily trends (last 7 days)
      const dailyTrends = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
        const count = allRequests?.filter(req => {
          const reqDate = new Date(req.submitted_at);
          return reqDate >= date && reqDate < nextDate;
        }).length || 0;
        
        dailyTrends.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count
        });
      }

      // Top applicants
      const applicantMap = new Map();
      allRequests?.forEach(req => {
        const key = req.student_id;
        if (!applicantMap.has(key)) {
          applicantMap.set(key, { student_id: req.student_id, count: 0, department: req.department });
        }
        applicantMap.get(key).count++;
      });
      const topApplicants = Array.from(applicantMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Checkout stats
      const { data: allCheckouts, error: checkoutError } = await supabase
        .from('check_logs')
        .select('*');

      if (checkoutError) throw checkoutError;

      const { data: todayCheckouts, error: todayCheckoutError } = await supabase
        .from('check_logs')
        .select('*')
        .gte('timestamp', today.toISOString());

      if (todayCheckoutError) throw todayCheckoutError;

      const { data: weekCheckouts, error: weekCheckoutError } = await supabase
        .from('check_logs')
        .select('*')
        .gte('timestamp', weekAgo.toISOString());

      if (weekCheckoutError) throw weekCheckoutError;

      const checkoutStats = {
        today: todayCheckouts?.length || 0,
        week: weekCheckouts?.length || 0,
        total: allCheckouts?.length || 0,
      };

      // Pending aging
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      
      const pendingRequests = allRequests?.filter(r => r.status === 'Pending') || [];
      const pendingAging = {
        overOneDay: pendingRequests.filter(r => new Date(r.submitted_at) < oneDayAgo).length,
        overTwoDays: pendingRequests.filter(r => new Date(r.submitted_at) < twoDaysAgo).length,
      };

      setAnalytics({
        totalRequests: allRequests?.length || 0,
        todayRequests: todayRequests?.length || 0,
        weekRequests: weekRequests?.length || 0,
        statusBreakdown,
        departmentStats,
        dailyTrends,
        topApplicants,
        checkoutStats,
        pendingAging,
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }: any) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color} mt-2`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-4 text-sm">
          {trend > 0 ? (
            <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={trend > 0 ? 'text-green-600' : 'text-red-600'}>
            {Math.abs(trend)}% from last period
          </span>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-500">Failed to load analytics data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive insights into gatepass system</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="all">All Time</option>
            </select>
            <button
              onClick={onBack}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Admin
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Requests"
            value={analytics.totalRequests}
            icon={Users}
            color="text-blue-600"
            subtitle={`${analytics.todayRequests} today`}
          />
          <StatCard
            title="Pending Requests"
            value={analytics.statusBreakdown.pending}
            icon={Clock}
            color="text-yellow-600"
            subtitle={`${analytics.pendingAging.overOneDay} over 1 day`}
          />
          <StatCard
            title="Approved Today"
            value={analytics.statusBreakdown.approved}
            icon={CheckCircle}
            color="text-green-600"
          />
          <StatCard
            title="Check-outs Today"
            value={analytics.checkoutStats.today}
            icon={Activity}
            color="text-purple-600"
            subtitle={`${analytics.checkoutStats.week} this week`}
          />
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Status Breakdown
            </h3>
            <div className="space-y-4">
              {Object.entries(analytics.statusBreakdown).map(([status, count]) => {
                const colors = {
                  pending: 'bg-yellow-500',
                  approved: 'bg-green-500',
                  rejected: 'bg-red-500',
                  returned: 'bg-blue-500'
                };
                const percentage = analytics.totalRequests > 0 ? (count / analytics.totalRequests * 100) : 0;
                
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${colors[status as keyof typeof colors]}`}></div>
                      <span className="capitalize font-medium text-gray-700">{status}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900 font-semibold">{count}</span>
                      <span className="text-gray-500 text-sm">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
              Pending Requests Aging
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div>
                  <p className="font-medium text-yellow-800">Over 1 Day</p>
                  <p className="text-sm text-yellow-600">Requires attention</p>
                </div>
                <span className="text-2xl font-bold text-yellow-700">
                  {analytics.pendingAging.overOneDay}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="font-medium text-red-800">Over 2 Days</p>
                  <p className="text-sm text-red-600">Urgent action needed</p>
                </div>
                <span className="text-2xl font-bold text-red-700">
                  {analytics.pendingAging.overTwoDays}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Department Stats and Daily Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="h-5 w-5 mr-2 text-indigo-600" />
              Requests by Department
            </h3>
            <div className="space-y-3">
              {analytics.departmentStats.slice(0, 6).map((dept, index) => (
                <div key={dept.department} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold text-sm">{index + 1}</span>
                    </div>
                    <span className="text-gray-700 text-sm font-medium truncate max-w-48">
                      {dept.department}
                    </span>
                  </div>
                  <span className="text-gray-900 font-semibold">{dept.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Daily Trends (Last 7 Days)
            </h3>
            <div className="space-y-3">
              {analytics.dailyTrends.map((day, index) => {
                const maxCount = Math.max(...analytics.dailyTrends.map(d => d.count));
                const width = maxCount > 0 ? (day.count / maxCount * 100) : 0;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm font-medium w-16">{day.date}</span>
                    <div className="flex-1 mx-3">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${width}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-gray-900 font-semibold w-8 text-right">{day.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Applicants */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-purple-600" />
            Top Applicants
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Rank</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Student ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Requests</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topApplicants.map((applicant, index) => (
                  <tr key={applicant.student_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold text-sm">{index + 1}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{applicant.student_id}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{applicant.department || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-medium">
                        {applicant.count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}