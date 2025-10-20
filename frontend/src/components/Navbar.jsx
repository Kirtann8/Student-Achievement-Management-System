import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, BarChart3, Award, Home } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActivePath = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl group-hover:from-blue-600 group-hover:to-indigo-700 transition-all duration-300 shadow-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  SAM System
                </span>
                <span className="text-xs text-gray-500 -mt-1">Achievement Management</span>
              </div>
            </Link>
          </div>

          {user && (
            <>
              {/* Desktop menu */}
              <div className="hidden md:flex items-center space-x-1">
                <Link
                  to="/"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActivePath('/') 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                
                {user.role === 'admin' && (
                  <Link
                    to="/analytics"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActivePath('/analytics') 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Analytics</span>
                  </Link>
                )}
                
                <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800">{user.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        user.role === 'admin' 
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700' 
                          : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 group"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300"
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile menu */}
        {user && isMenuOpen && (
          <div className="md:hidden animate-fade-in">
            <div className="px-2 pt-2 pb-3 space-y-2 bg-white/90 backdrop-blur-sm rounded-2xl my-2 shadow-lg border border-gray-100">
              <Link
                to="/"
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActivePath('/') 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              
              {user.role === 'admin' && (
                <Link
                  to="/analytics"
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActivePath('/analytics') 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Analytics</span>
                </Link>
              )}
              
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center px-4 py-2 space-x-3">
                  <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{user.name}</p>
                    <p className={`text-xs px-2 py-1 rounded-full font-medium inline-block ${
                      user.role === 'admin' 
                        ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700' 
                        : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700'
                    }`}>
                      {user.role}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-all duration-300"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;