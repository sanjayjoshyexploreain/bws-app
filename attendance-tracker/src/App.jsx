import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LoginScreen from './screens/LoginScreen';
import WorkerDashboard from './screens/WorkerDashboard';
import AdminDashboard from './screens/AdminDashboard';
import SubmitEntryScreen from './screens/SubmitEntryScreen';
import EntryDetailScreen from './screens/EntryDetailScreen';
import AdminEntryDetail from './screens/AdminEntryDetail';
import AdminReportScreen from './screens/AdminReportScreen';
import WorkwearRequestScreen from './screens/WorkwearRequestScreen';
import StandalonePhotoUpload from './screens/StandalonePhotoUpload';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';

const AdminAccessGate = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Set the flag in sessionStorage
    sessionStorage.setItem('adminAccessGranted', 'true');
    // Redirect to login page immediately
    navigate('/', { replace: true });
  }, [navigate]);
  
  // Show nothing while redirecting
  return null;
}

function ProtectedRoute({ children, allowedRole }) {
  const { state } = useAuth();
  if (!state.isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (allowedRole && state.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  const { state } = useAuth();

  return (
    <BrowserRouter future={{ 
      v7_startTransition: true,
      v7_relativeSplatPath: true 
    }}>
      <Routes>
        <Route path="/bws-admin" element={<AdminAccessGate />} />
        <Route path="/" element={
          !state.isAuthenticated ? <LoginScreen /> :
          state.role === 'Admin' ? <AdminDashboard /> :
          <WorkerDashboard />
        } />
        
        <Route path="/submit" element={
          <ProtectedRoute allowedRole="Worker">
            <SubmitEntryScreen />
          </ProtectedRoute>
        } />
        
        <Route path="/workwear" element={
          <ProtectedRoute allowedRole="Worker">
            <WorkwearRequestScreen />
          </ProtectedRoute>
        } />

        <Route path="/upload-photo" element={
          <ProtectedRoute allowedRole="Worker">
            <StandalonePhotoUpload />
          </ProtectedRoute>
        } />
        
        <Route path="/entry/:entryId" element={
          <ProtectedRoute allowedRole="Worker">
            <EntryDetailScreen />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/entry/:entryId" element={
          <ProtectedRoute allowedRole="Admin">
            <AdminEntryDetail />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/report" element={
          <ProtectedRoute allowedRole="Admin">
            <AdminReportScreen />
          </ProtectedRoute>
        } />
        
        <Route path="/privacy-policy" element={<PrivacyPolicyScreen />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
