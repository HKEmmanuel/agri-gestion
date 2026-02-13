import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Menu } from 'lucide-react';

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

const Layout = ({ children }) => { // Simple wrapper to enforce layout
    return <>{children}</>;
};

const AuthenticatedLayout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (!user) return <Navigate to="/login" />;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row transition-all duration-300">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} logout={logout} user={user} />
            
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
                {/* Mobile Header */}
                <div className="md:hidden sticky top-0 w-full bg-green-700 text-white z-40 p-4 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-green-600 rounded-lg transition">
                            <Menu size={24} />
                        </button>
                        <span className="font-bold text-lg tracking-tight">Agri-Gestion</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs ring-2 ring-white/30">
                        {user.name?.charAt(0) || 'U'}
                    </div>
                </div>

                <main className="flex-grow overflow-x-hidden">
                    {children}
                </main>
            </div>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

// Wrapper for public routes to prevent logged-in users from seeing them
const PublicRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return null; // Or a spinner
    if (user) return <Navigate to="/" />;
    return children;
};

// Wrapper for protected routes
const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div className="min-h-screen flex items-center justify-center text-green-700 font-bold">Chargement...</div>;
    return user ? <AuthenticatedLayout>{children}</AuthenticatedLayout> : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div className="min-h-screen flex items-center justify-center text-green-700 font-bold">Chargement...</div>;
    if (!user || user.role !== 'admin') return <Navigate to="/" />;
    return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            
            <Route path="/" element={
                <PrivateRoute>
                    <AuthContext.Consumer>
                        {({ user }) => user?.role === 'admin' ? <Navigate to="/admin" /> : <Dashboard />}
                    </AuthContext.Consumer>
                </PrivateRoute>
            } />
            
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            
            <Route path="/exploitation/:id" element={<PrivateRoute><ExploitationDetails /></PrivateRoute>} />
            <Route path="/parcelle/:id" element={<PrivateRoute><ParcelleDetails /></PrivateRoute>} />
            <Route path="/culture/:id" element={<PrivateRoute><CultureDetails /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
