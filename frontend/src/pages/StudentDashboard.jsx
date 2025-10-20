import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { achievementService } from '../services/achievementService';
import AchievementCard from '../components/AchievementCard';
import AchievementForm from '../components/AchievementForm';
import toast from 'react-hot-toast';
import { Plus, Filter, Search, Award, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [filteredAchievements, setFilteredAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: ''
  });

  const loadAchievements = async () => {
    try {
      const data = await achievementService.getMyAchievements();
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
        achievement.description.toLowerCase().includes(filters.search.toLowerCase())
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

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAchievement(null);
    loadAchievements();
    toast.success(editingAchievement ? 'Achievement updated successfully! 🎉' : 'Achievement created successfully! 🎉');
  };

  const handleEdit = (achievement) => {
    setEditingAchievement(achievement);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this achievement?')) {
      return;
    }

    try {
      await achievementService.deleteAchievement(id);
      toast.success('Achievement deleted successfully!');
      loadAchievements();
    } catch (error) {
      toast.error('Failed to delete achievement');
      console.error('Error deleting achievement:', error);
    }
  };

  const getStatusCounts = () => {
    return achievements.reduce((counts, achievement) => {
      counts[achievement.status] = (counts[achievement.status] || 0) + 1;
      return counts;
    }, {});
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
          <Award className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2 text-lg">Manage and track your achievement certificates</p>
      </div>

      {/* Quick Action */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            setEditingAchievement(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl hover:shadow-xl transition-all duration-300 font-semibold text-lg group transform hover:scale-105"
        >
          <Plus className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
          Add New Achievement
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Achievements</p>
              <p className="text-3xl font-bold text-gray-900">{achievements.length}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl group-hover:scale-110 transition-transform">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Approved</p>
              <p className="text-3xl font-bold text-green-600">{statusCounts.Approved || 0}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl group-hover:scale-110 transition-transform">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-600">{statusCounts.Pending || 0}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl group-hover:scale-110 transition-transform">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Success Rate</p>
              <p className="text-3xl font-bold text-purple-600">
                {achievements.length > 0 ? Math.round(((statusCounts.Approved || 0) / achievements.length) * 100) : 0}%
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-3">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">Filter & Search:</span>
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300"
          >
            <option value="">All Categories</option>
            <option value="Academic">Academic</option>
            <option value="Sports">Sports</option>
            <option value="Extracurricular">Extracurricular</option>
          </select>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search achievements..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300"
              />
              <Search className="absolute left-4 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
            <AchievementForm
              achievement={editingAchievement}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowForm(false);
                setEditingAchievement(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Achievements Grid */}
      {filteredAchievements.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4">
            <Award className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {achievements.length === 0 ? "No achievements yet" : "No matches found"}
          </h3>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            {achievements.length === 0 
              ? "Start your journey by adding your first achievement! Click the button above to get started." 
              : "Try adjusting your filters or search terms to find what you're looking for."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement, index) => (
            <div key={achievement._id} style={{ animationDelay: `${index * 100}ms` }} className="animate-slide-in-left">
              <AchievementCard
                achievement={achievement}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;