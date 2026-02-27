import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import StudentProfile from './pages/StudentProfile';
import CreateDrive from './pages/CreateDrive';
import DriveDetail from './pages/DriveDetail';
import StudentJobs from './pages/StudentJobs';
import Layout from './components/Layout';

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={
        user
          ? <Navigate to={user.role === 'officer' ? '/officer' : '/student'} replace />
          : <LandingPage />
      } />
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />

      {/* Authenticated Routes with Layout/Sidebar */}
      <Route element={<Layout />}>
        {/* Student Routes */}
        <Route path="/student" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
        <Route path="/student/profile" element={<PrivateRoute role="student"><StudentProfile /></PrivateRoute>} />
        <Route path="/student/jobs" element={<PrivateRoute role="student"><StudentJobs /></PrivateRoute>} />

        {/* Officer Routes */}
        <Route path="/officer" element={<PrivateRoute role="officer"><OfficerDashboard /></PrivateRoute>} />
        <Route path="/officer/drives/new" element={<PrivateRoute role="officer"><CreateDrive /></PrivateRoute>} />
        <Route path="/officer/drives/:id" element={<PrivateRoute role="officer"><DriveDetail /></PrivateRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#ffffff',
              color: '#111827',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
