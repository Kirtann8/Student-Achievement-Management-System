import React from 'react';
import { CheckCircle, XCircle, Clock, FileText, Calendar, Tag, Eye, Edit, Trash2, ThumbsUp, ThumbsDown } from 'lucide-react';

const AchievementCard = ({ achievement, onEdit, onDelete, onReview, isAdmin = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200';
      case 'Rejected':
        return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200';
      default:
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Academic':
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200';
      case 'Sports':
        return 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200';
      case 'Extracurricular':
        return 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-white/20 hover:scale-[1.02] animate-fade-in h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-gray-900 transition-colors line-clamp-2">
          {achievement.title}
        </h3>
        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 border transition-all duration-300 ${getStatusColor(achievement.status)}`}>
          {getStatusIcon(achievement.status)}
          <span>{achievement.status}</span>
        </div>
      </div>

      {/* Student info for admin */}
      {isAdmin && achievement.student && (
        <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {achievement.student.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{achievement.student.name}</p>
              <p className="text-xs text-gray-500">{achievement.student.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Achievement details */}
      <div className="space-y-3 mb-4 flex-grow">
        <div className="flex items-center space-x-3">
          <Tag className="h-4 w-4 text-gray-400" />
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${getCategoryColor(achievement.category)}`}>
            {achievement.category}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{formatDate(achievement.date)}</span>
        </div>

        <div className="flex items-start space-x-3 text-sm text-gray-600 min-h-[3rem]">
          <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="flex-1 leading-relaxed line-clamp-2">
            {achievement.description || "No description provided."}
          </p>
        </div>
      </div>

      {/* Certificate link */}
      {achievement.filePath && (
        <div className="mb-4">
          <a
            href={`http://localhost:5000${achievement.filePath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 rounded-xl text-sm font-medium transition-all duration-300 border border-blue-200 hover:border-blue-300 group/link"
          >
            <Eye className="h-4 w-4 group-hover/link:scale-110 transition-transform" />
            <span>View Certificate</span>
          </a>
        </div>
      )}

      {/* Review comment */}
      {achievement.reviewerComment && (
        <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Admin Review:</p>
              <p className="text-sm text-gray-700 leading-relaxed">{achievement.reviewerComment}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-400">
          Submitted {formatDate(achievement.createdAt)}
        </div>
        
        <div className="flex space-x-2">
          {!isAdmin && achievement.status === 'Pending' && (
            <>
              <button
                onClick={() => onEdit(achievement)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-700 rounded-lg text-xs font-medium transition-all duration-300 border border-blue-200 hover:border-blue-300 group/edit"
              >
                <Edit className="h-3 w-3 group-hover/edit:scale-110 transition-transform" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => onDelete(achievement._id)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-red-100 to-rose-100 hover:from-red-200 hover:to-rose-200 text-red-700 rounded-lg text-xs font-medium transition-all duration-300 border border-red-200 hover:border-red-300 group/delete"
              >
                <Trash2 className="h-3 w-3 group-hover/delete:scale-110 transition-transform" />
                <span>Delete</span>
              </button>
            </>
          )}

          {isAdmin && achievement.status === 'Pending' && (
            <>
              <button
                onClick={() => onReview(achievement._id, 'approve')}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-green-700 rounded-lg text-xs font-medium transition-all duration-300 border border-green-200 hover:border-green-300 group/approve"
              >
                <ThumbsUp className="h-3 w-3 group-hover/approve:scale-110 transition-transform" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => onReview(achievement._id, 'reject')}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-red-100 to-rose-100 hover:from-red-200 hover:to-rose-200 text-red-700 rounded-lg text-xs font-medium transition-all duration-300 border border-red-200 hover:border-red-300 group/reject"
              >
                <ThumbsDown className="h-3 w-3 group-hover/reject:scale-110 transition-transform" />
                <span>Reject</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;