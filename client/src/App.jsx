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

const Layout = ({ children }) => {
  const { user } = useContext(AuthContext);
  return (
    <div className={`min-h-screen ${user ? 'pl-64' : ''}`}>
      {children}
      {user && <Sidebar />}
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
