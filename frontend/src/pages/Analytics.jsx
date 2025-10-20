import React, { useState, useEffect } from 'react';
import { achievementService } from '../services/achievementService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Download, Calendar, Target, Award, AlertCircle, RefreshCw } from 'lucide-react';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadAnalytics = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await achievementService.getAnalytics();
      setAnalyticsData(data);
      setLastUpdated(new Date());
    } catch (error) {
      toast.error('Failed to load analytics data');
      console.error('Error loading analytics:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      loadAnalytics(false); // Don't show loading spinner for auto-refresh
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading && !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-12 w-12 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load analytics data</h3>
        <p className="text-gray-500">Please try refreshing the page or contact support.</p>
      </div>
    );
  }

  // Colors for charts
  const categoryColors = {
    Academic: '#3b82f6',     // blue
    Sports: '#f97316',       // orange
    Extracurricular: '#8b5cf6' // purple
  };

  const statusColors = {
    Pending: '#eab308',    // yellow
    Approved: '#22c55e',   // green
    Rejected: '#ef4444'    // red
  };

  // Prepare data for charts
  const categoryData = analyticsData.byCategory.map(item => ({
    name: item.category,
    value: item.count,
    fill: categoryColors[item.category] || '#6b7280'
  }));

  const statusData = analyticsData.byStatus.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    fill: statusColors[item.status] || '#6b7280'
  }));

  const monthlyData = analyticsData.monthly.map(item => ({
    month: item.month,
    submissions: item.count
  }));

  // Calculate totals and percentages
  const totalSubmissions = analyticsData.byStatus.reduce((sum, item) => sum + item.count, 0);
  const approvedCount = analyticsData.byStatus.find(item => item.status === 'Approved')?.count || 0;
  const pendingCount = analyticsData.byStatus.find(item => item.status === 'Pending')?.count || 0;
  const rejectedCount = analyticsData.byStatus.find(item => item.status === 'Rejected')?.count || 0;
  const approvalRate = totalSubmissions > 0 ? ((approvedCount / totalSubmissions) * 100).toFixed(1) : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-lg backdrop-blur-sm">
          <p className="font-semibold text-gray-900">{`${label}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-lg backdrop-blur-sm">
          <p className="font-semibold text-gray-900">{`${data.name}: ${data.value}`}</p>
          <p className="text-sm text-gray-600">
            {totalSubmissions > 0 ? `${((data.value / totalSubmissions) * 100).toFixed(1)}% of total` : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fadeIn relative">
      {/* Loading overlay for refresh */}
      {loading && analyticsData && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl">
          <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700 font-medium">Refreshing analytics data...</span>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <h1 className="text-4xl font-bold mb-2">Analytics Dashboard 📊</h1>
            <p className="text-indigo-100 text-lg">
              Real-time insights into achievement submissions and performance trends
            </p>
            {lastUpdated && (
              <p className="text-indigo-200 text-sm mt-2">
                🔄 Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refreshes every 10s
              </p>
            )}
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => loadAnalytics(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 disabled:opacity-50"
              disabled={loading}
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh Now'}</span>
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20"
            >
              <Download className="h-5 w-5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Status Banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-800 font-medium">📡 Real-time Analytics Active</span>
        </div>
        <div className="text-sm text-green-600">
          Data updates automatically every 30 seconds
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Submissions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalSubmissions}</p>
              <p className="text-sm text-gray-500 mt-1">📈 All time</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Approved</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{approvedCount}</p>
              <p className="text-sm text-green-600 mt-1">✅ Verified</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center">
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Approval Rate</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{approvalRate}%</p>
              <p className="text-sm text-green-600 mt-1">🎯 Success rate</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-teal-200 rounded-2xl flex items-center justify-center">
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
              <p className="text-sm text-yellow-600 mt-1">⏳ Awaiting</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-2xl flex items-center justify-center">
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Achievements by Category */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Achievements by Category</h3>
            <PieChartIcon className="h-6 w-6 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => percent > 5 ? `${name}\n${(percent * 100).toFixed(0)}%` : ''}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-6 grid grid-cols-1 gap-3">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.fill }}
                  ></div>
                  <span className="font-medium text-gray-900">
                    {item.name === 'Academic' && '🎓'} 
                    {item.name === 'Sports' && '⚽'} 
                    {item.name === 'Extracurricular' && '🎭'} 
                    {item.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900">{item.value}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({totalSubmissions > 0 ? ((item.value / totalSubmissions) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements by Status */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Review Status Distribution</h3>
            <BarChart3 className="h-6 w-6 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[8, 8, 0, 0]}
                fill="#8884d8"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-6 grid grid-cols-1 gap-3">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.fill }}
                  ></div>
                  <span className="font-medium text-gray-900">
                    {item.name === 'Pending' && '⏳'} 
                    {item.name === 'Approved' && '✅'} 
                    {item.name === 'Rejected' && '❌'} 
                    {item.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900">{item.value}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({totalSubmissions > 0 ? ((item.value / totalSubmissions) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Submissions Trend */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Monthly Submissions Trend</h3>
          <TrendingUp className="h-6 w-6 text-gray-400" />
        </div>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="submissions" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-10 w-10 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No trend data available</h4>
            <p className="text-gray-500">Monthly trends will appear here once more data is collected.</p>
          </div>
        )}
      </div>

      {/* Performance Insights */}
      {totalSubmissions > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">📈 Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-xl border border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-2">{approvalRate}%</div>
              <div className="text-sm font-medium text-gray-600">Overall Approval Rate</div>
              <div className="text-xs text-gray-500 mt-1">
                {approvalRate >= 80 ? 'Excellent' : approvalRate >= 60 ? 'Good' : 'Needs Improvement'}
              </div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl border border-blue-100">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {Math.round(totalSubmissions / Math.max(categoryData.length, 1))}
              </div>
              <div className="text-sm font-medium text-gray-600">Avg per Category</div>
              <div className="text-xs text-gray-500 mt-1">Distribution balance</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl border border-blue-100">
              <div className="text-3xl font-bold text-purple-600 mb-2">{pendingCount}</div>
              <div className="text-sm font-medium text-gray-600">Pending Reviews</div>
              <div className="text-xs text-gray-500 mt-1">
                {pendingCount === 0 ? 'All caught up!' : 'Needs attention'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;