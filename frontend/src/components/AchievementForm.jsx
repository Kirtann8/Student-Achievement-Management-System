import React, { useState } from 'react';
import { achievementService } from '../services/achievementService';
import { X, Upload, Calendar, FileText, Tag, Type, CheckCircle, AlertCircle } from 'lucide-react';

const AchievementForm = ({ achievement, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: achievement?.title || '',
    category: achievement?.category || '',
    description: achievement?.description || '',
    date: achievement?.date ? new Date(achievement.date).toISOString().split('T')[0] : ''
  });
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (selectedFile) => {
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setErrors(prev => ({
          ...prev,
          file: 'Only PDF, PNG, and JPEG files are allowed'
        }));
        return;
      }
      
      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          file: 'File size must be less than 5MB'
        }));
        return;
      }
      
      setFile(selectedFile);
      setErrors(prev => ({
        ...prev,
        file: ''
      }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    // File is required only for new achievements
    if (!achievement && !file) {
      newErrors.file = 'Certificate file is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('date', formData.date);
      
      if (file) {
        data.append('certificate', file);
      }

      if (achievement) {
        await achievementService.updateAchievement(achievement._id, data);
      } else {
        await achievementService.createAchievement(data);
      }

      onSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Something went wrong';
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {achievement ? 'Edit Achievement' : 'Add New Achievement'}
          </h2>
          <p className="text-gray-600 mt-1">
            {achievement ? 'Update your achievement details' : 'Share your accomplishment with the world'}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <Type className="h-4 w-4 mr-2 text-blue-500" />
            Achievement Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm ${
              errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="Enter a descriptive title for your achievement"
          />
          {errors.title && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.title}</span>
            </div>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label htmlFor="category" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <Tag className="h-4 w-4 mr-2 text-purple-500" />
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm ${
              errors.category ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <option value="">Select a category</option>
            <option value="Academic">🎓 Academic</option>
            <option value="Sports">⚽ Sports</option>
            <option value="Extracurricular">🎭 Extracurricular</option>
          </select>
          {errors.category && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.category}</span>
            </div>
          )}
        </div>

        {/* Date */}
        <div className="space-y-2">
          <label htmlFor="date" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <Calendar className="h-4 w-4 mr-2 text-green-500" />
            Achievement Date *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]} // Can't select future dates
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm ${
              errors.date ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          />
          {errors.date && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.date}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <FileText className="h-4 w-4 mr-2 text-indigo-500" />
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:border-gray-400 resize-none"
            placeholder="Describe your achievement in detail..."
          />
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <Upload className="h-4 w-4 mr-2 text-orange-500" />
            Certificate File {!achievement && '*'}
          </label>
          
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : errors.file 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="space-y-3">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              
              {file ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">{file.name}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-700">
                    Drop your certificate here or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supported formats: PDF, PNG, JPEG • Max size: 5MB
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {errors.file && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.file}</span>
            </div>
          )}
          
          {achievement?.filePath && !file && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <a
                href={`http://localhost:5000${achievement.filePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                📎 View current certificate
              </a>
            </div>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{errors.submit}</span>
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
            disabled={isLoading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{achievement ? 'Updating...' : 'Creating...'}</span>
              </div>
            ) : (
              achievement ? 'Update Achievement' : 'Create Achievement'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AchievementForm;