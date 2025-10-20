import React from 'react';
import { Award } from 'lucide-react';

const LoadingSpinner = ({ size = 'large', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8', 
    large: 'h-12 w-12'
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex flex-col items-center space-y-6">
        {/* Logo with pulse animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-ping opacity-75"></div>
          <div className="relative p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-2xl">
            <Award className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Spinner */}
        <div className="relative">
          <div className={`${sizeClasses[size]} border-4 border-blue-200 rounded-full animate-spin`}>
            <div className="absolute top-0 left-0 h-full w-full border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700 animate-pulse">{message}</p>
          <div className="flex justify-center mt-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;