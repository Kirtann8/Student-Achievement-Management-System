import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { achievementService } from '../services/achievementService';
import AchievementCard from '../components/AchievementCard';
import ReviewModal from '../components/ReviewModal';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Filter, Search, Users, CheckCircle, XCircle, Clock, TrendingUp, Award, BarChart3, Calendar } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [filteredAchievements, setFilteredAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState({ show: false, achievement: null, action: null });
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: ''
  });

  const loadAchievements = async () => {
    try {
      const data = await achievementService.getAllAchievements();
      setAchievements(data);
      setFilteredAchievements(data);
    } catch (error) {
      toast.error('Failed to load achievements');
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  useEffect(() => {
    let filtered = achievements;

    if (filters.status) {
      filtered = filtered.filter(achievement => achievement.status === filters.status);
    }

    if (filters.category) {
      filtered = filtered.filter(achievement => achievement.category === filters.category);
    }

    if (filters.search) {
      filtered = filtered.filter(achievement => 
        achievement.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        achievement.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        achievement.student?.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        achievement.student?.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredAchievements(filtered);
  }, [achievements, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleReview = (id, action) => {
    const achievement = achievements.find(a => a._id === id);
    if (achievement) {
      setReviewModal({ show: true, achievement, action });
    }
  };

  const handleReviewSubmit = async (comment) => {
    try {
      await achievementService.reviewAchievement(
        reviewModal.achievement._id,
        reviewModal.action,
        comment
      );
      
      toast.success(`Achievement ${reviewModal.action}d successfully!`);
      setReviewModal({ show: false, achievement: null, action: null });
      loadAchievements();
    } catch (error) {
      toast.error(`Failed to ${reviewModal.action} achievement`);
      console.error('Error reviewing achievement:', error);
    }
  };

  const getStatusCounts = () => {
    return achievements.reduce((counts, achievement) => {
      counts[achievement.status] = (counts[achievement.status] || 0) + 1;
      return counts;
    }, {});
  };

  const getCategoryCounts = () => {
    return achievements.reduce((counts, achievement) => {
      counts[achievement.category] = (counts[achievement.category] || 0) + 1;
      return counts;
    }, {});
  };

  const getUniqueStudents = () => {
    const studentIds = [...new Set(achievements.map(a => a.student?._id))].filter(Boolean);
    return studentIds.length;
  };

  const getRecentSubmissions = () => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return achievements.filter(a => new Date(a.createdAt) >= weekAgo).length;
  };

  const statusCounts = getStatusCounts();
  const categoryCounts = getCategoryCounts();
  const uniqueStudents = getUniqueStudents();
  const recentSubmissions = getRecentSubmissions();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
            <p className="text-indigo-100 text-lg">
              Manage and review student achievement submissions
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Award className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Students</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{uniqueStudents}</p>
              <p className="text-sm text-green-600 mt-1">📈 Participating</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Pending Review</h3>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{statusCounts.Pending || 0}</p>
              <p className="text-sm text-yellow-600 mt-1">⏳ Awaiting action</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Approved</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{statusCounts.Approved || 0}</p>
              <p className="text-sm text-green-600 mt-1">✅ Verified</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">This Week</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">{recentSubmissions}</p>
              <p className="text-sm text-purple-600 mt-1">📅 New submissions</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>



      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
              <Filter className="h-5 w-5 text-indigo-600" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Filter Achievements</span>
          </div>
          
          <div className="flex flex-wrap gap-4 flex-1">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm min-w-[140px]"
            >
              <option value="">All Status</option>
              <option value="pending">🟡 Pending</option>
              <option value="approved">🟢 Approved</option>
              <option value="rejected">🔴 Rejected</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm min-w-[160px]"
            >
              <option value="">All Categories</option>
              <option value="Academic">🎓 Academic</option>
              <option value="Sports">⚽ Sports</option>
              <option value="Extracurricular">🎭 Extracurricular</option>
            </select>

            <div className="flex-1 min-w-[280px] max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search achievements, students, or descriptions..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                />
                <Search className="absolute left-4 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal.show && (
        <ReviewModal
          achievement={reviewModal.achievement}
          action={reviewModal.action}
          onSubmit={handleReviewSubmit}
          onCancel={() => setReviewModal({ show: false, achievement: null, action: null })}
        />
      )}

      {/* Achievements Grid */}
      {filteredAchievements.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {achievements.length === 0 
              ? "No achievements submitted yet" 
              : "No achievements match your filters"}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {achievements.length === 0 
              ? "Students haven't submitted any achievements yet. They'll appear here once submitted." 
              : "Try adjusting your filters or search terms to find what you're looking for."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => (
            <AchievementCard
              key={achievement._id}
              achievement={achievement}
              onReview={handleReview}
              isAdmin={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;