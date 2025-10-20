import React, { useState } from 'react';
import { X, CheckCircle, XCircle, MessageSquare, FileText, Calendar, User, Tag, ExternalLink, AlertCircle } from 'lucide-react';

const ReviewModal = ({ achievement, action, onSubmit, onCancel }) => {
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await onSubmit(comment);
    } catch (err) {
      setError('Failed to process review. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isApprove = action === 'approve';

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Academic':
        return '🎓';
      case 'Sports':
        return '⚽';
      case 'Extracurricular':
        return '🎭';
      default:
        return '🏆';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`px-8 py-6 border-b border-gray-200 ${
          isApprove 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50' 
            : 'bg-gradient-to-r from-red-50 to-rose-50'
        }`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {isApprove ? (
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              )}
              <div>
                <h2 className={`text-2xl font-bold ${isApprove ? 'text-green-800' : 'text-red-800'}`}>
                  {isApprove ? 'Approve' : 'Reject'} Achievement
                </h2>
                <p className="text-gray-600 text-sm">
                  {isApprove 
                    ? 'Confirm approval and add optional feedback' 
                    : 'Provide reason for rejection'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-xl transition-all duration-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-8 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Achievement Info */}
          <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{achievement.title}</h3>
            
            {/* Student Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Student</p>
                  <p className="font-medium text-gray-900">{achievement.student?.name}</p>
                  <p className="text-sm text-gray-500">{achievement.student?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                <Tag className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium text-gray-900">
                    {getCategoryIcon(achievement.category)} {achievement.category}
                  </p>
                </div>
              </div>
            </div>

            {/* Date and Description */}
            {achievement.date && (
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 mb-4">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Achievement Date</p>
                  <p className="font-medium text-gray-900">{formatDate(achievement.date)}</p>
                </div>
              </div>
            )}

            {achievement.description && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Description</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-700 text-sm leading-relaxed">{achievement.description}</p>
                </div>
              </div>
            )}

            {/* Certificate Link */}
            {achievement.filePath && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <a
                  href={`http://localhost:5000${achievement.filePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-orange-600 hover:text-orange-800 font-medium transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View Certificate</span>
                </a>
              </div>
            )}
          </div>

          {/* Comment Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="comment" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" />
                {isApprove ? 'Approval Comment (Optional)' : 'Rejection Reason (Required)'}
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none"
                placeholder={
                  isApprove 
                    ? 'Add a congratulatory message or additional feedback...'
                    : 'Please explain why this achievement is being rejected...'
                }
                required={!isApprove}
              />
              {!isApprove && (
                <p className="text-xs text-gray-500 mt-2">
                  A detailed reason helps students understand how to improve their submissions.
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || (!isApprove && !comment.trim())}
                className={`px-8 py-3 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${
                  isApprove 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                    : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  `${isApprove ? 'Approve' : 'Reject'} Achievement`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;