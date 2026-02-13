import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

import ExploitationDetails from './pages/ExploitationDetails';
import ParcelleDetails from './pages/ParcelleDetails';
import CultureDetails from './pages/CultureDetails';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

import { Menu } from 'lucide-react';
import { useState } from 'react';

const Layout = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${user ? 'md:pl-64' : ''} transition-all duration-300`}>
      {/* Mobile Header */}
      {user && (
        <div className="md:hidden fixed top-0 w-full bg-green-700 text-white z-50 p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
                <button onClick={() => setSidebarOpen(true)} className="p-1 hover:bg-green-600 rounded-lg transition">
                    <Menu size={24} />
                </button>
                <span className="font-bold text-lg">Agri-Gestion</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                {user.name.charAt(0)}
            </div>
        </div>
      )}
      
      {/* Spacer for fixed header on mobile */}
      {user && <div className="md:hidden h-16 flex-shrink-0"></div>}

      <div className="flex-grow">
        {children}
      </div>
      
      {user && <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />}
    </div>
  );
};

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <PrivateRoute>
                <AuthContext.Consumer>
                  {({ user }) => user?.role === 'admin' ? <Navigate to="/admin" /> : <Dashboard />}
                </AuthContext.Consumer>
              </PrivateRoute>
            } />
            <Route path="/exploitation/:id" element={<PrivateRoute><ExploitationDetails /></PrivateRoute>} />
            <Route path="/parcelle/:id" element={<PrivateRoute><ParcelleDetails /></PrivateRoute>} />
            <Route path="/culture/:id" element={<PrivateRoute><CultureDetails /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
