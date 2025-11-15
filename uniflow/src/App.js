import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AuthCard from './components/AuthCard';
import DashBord from './pages/DashBord';
import DoctorMedicalPage from './pages/DoctorMedicalPage';
import HostelNoticePage from './pages/HostelNoticePage';
import NoticePage from './pages/NoticePage';
import Canteen from './pages/Canteen';
import Medical from './pages/Medical';
import Qr from './pages/Qr';
import StudentHostelView from './pages/StudentHostelView';
import Hostal from './admins/Hostal';
import AdminCanteen from './admins/Canteen';
import AdminMedical from './admins/Medical';

const getStoredValue = (key) => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    return null;
  }
};

const isAuthenticated = () => getStoredValue('isAuthenticated') === 'true';
const getRole = () => getStoredValue('role');
const getDefaultRoute = (role) => {
  if (role === 'warden') {
    return '/warden';
  }
  if (role === 'doctor') {
    return '/doctor';
  }
  if (role === 'hostal') {
    return '/hostal';
  }
  if (role === 'canteen') {
    return '/canteen-admin';
  }
  if (role === 'medical-admin') {
    return '/medical-admin';
  }
  return '/dashboard';
};

function App() {
  const location = useLocation();
  const [auth, setAuth] = useState(() => isAuthenticated());
  const [role, setRole] = useState(() => getRole());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleStorage = () => {
      setAuth(isAuthenticated());
      setRole(getRole());
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    setAuth(isAuthenticated());
    setRole(getRole());
  }, [location.pathname]);

  const handleLoginSuccess = () => {
    setAuth(true);
    setRole(getRole());
  };

  const defaultRoute = getDefaultRoute(role);

  if (!auth) {
    return (
      <Routes>
        <Route
          path="/login"
          element={<AuthCard onAuthSuccess={handleLoginSuccess} />}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={<Navigate to={defaultRoute} replace />}
      />
      <Route path="/" element={<Navigate to={defaultRoute} replace />} />
      <Route path="/dashboard" element={<DashBord />} />
      <Route path="/notice" element={<NoticePage />} />
      <Route path="/canteen" element={<Canteen />} />
      <Route path="/medical" element={<Medical />} />
      <Route path="/student" element={<StudentHostelView />} />
      <Route path="/notices" element={<HostelNoticePage />} />
      <Route
        path="/warden"
        element={
          role === 'warden' ? (
            <HostelNoticePage />
          ) : (
            <Navigate to={defaultRoute} replace />
          )
        }
      />
      <Route
        path="/doctor"
        element={
          role === 'doctor' ? (
            <DoctorMedicalPage />
          ) : (
            <Navigate to={defaultRoute} replace />
          )
        }
      />
      <Route
        path="/hostal"
        element={
          role === 'hostal' ? <Hostal /> : <Navigate to={defaultRoute} replace />
        }
      />
      <Route
        path="/canteen-admin"
        element={
          role === 'canteen' ? (
            <AdminCanteen />
          ) : (
            <Navigate to={defaultRoute} replace />
          )
        }
      />
      <Route
        path="/medical-admin"
        element={
          role === 'medical-admin' ? (
            <AdminMedical />
          ) : (
            <Navigate to={defaultRoute} replace />
          )
        }
      />
      <Route path="/qr" element={<Qr />} />
      <Route path="*" element={<Navigate to={defaultRoute} replace />} />
    </Routes>
  );
}

export default App;
