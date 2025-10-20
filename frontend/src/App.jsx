import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  if (!user) return <Navigate to="/login" />;
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// App Routes component (needs to be inside AuthProvider)
const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="animate-fade-in">
          <Routes>
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to="/" />} 
            />
            <Route 
              path="/register" 
              element={!user ? <Register /> : <Navigate to="/" />} 
            />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  {user?.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />}
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          },
          success: {
            style: {
              background: 'linear-gradient(135deg, #10b981, #059669)',
            },
          },
          error: {
            style: {
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            },
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;