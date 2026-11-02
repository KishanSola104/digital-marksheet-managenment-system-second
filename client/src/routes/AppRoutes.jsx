import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import HomePage from '../pages/HomePage';
import SchoolRegisterPage from '../pages/SchoolRegisterPage';
import SchoolLoginPage from '../pages/SchoolLoginPage';
import UserLoginPage from '../pages/UserLoginPage';
import ChangePasswordPage from '../pages/ChangePasswordPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';

// Simple placeholder view for future role dashboards
function FutureDashboardPlaceholder({ roleName }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 max-w-md text-center">
        <h2 className="text-xl font-bold text-navy-900">{roleName} Portal</h2>
        <p className="text-xs text-gray-500 mt-2">
          This role dashboard is prepared and will be implemented in subsequent phases.
        </p>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/register-school" element={<SchoolRegisterPage />} />
      <Route path="/school-login" element={<SchoolLoginPage />} />
      <Route path="/school-forgot-password" element={<ForgotPasswordPage type="school" />} />
      <Route path="/school-reset-password" element={<ResetPasswordPage type="school" />} />
      <Route path="/user-forgot-password" element={<ForgotPasswordPage type="user" />} />
      <Route path="/user-reset-password" element={<ResetPasswordPage type="user" />} />

      {/* Forced School Password Change */}
      <Route
        path="/school-change-password"
        element={
          <ProtectedRoute requireSchool={true}>
            <ChangePasswordPage type="school" />
          </ProtectedRoute>
        }
      />

      {/* User Login (Requires Active School Session) */}
      <Route
        path="/user-login"
        element={
          <ProtectedRoute requireSchool={true}>
            <UserLoginPage />
          </ProtectedRoute>
        }
      />

      {/* Forced User Password Change */}
      <Route
        path="/user-change-password"
        element={
          <ProtectedRoute requireSchool={true} requireUser={true}>
            <ChangePasswordPage type="user" />
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requireSchool={true} requireUser={true} allowedRoles={['ADMIN']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Future Role Dashboards */}
      <Route
        path="/head-teacher/dashboard"
        element={
          <ProtectedRoute requireSchool={true} requireUser={true} allowedRoles={['HEAD_TEACHER']}>
            <FutureDashboardPlaceholder roleName="Head Teacher" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute requireSchool={true} requireUser={true} allowedRoles={['TEACHER']}>
            <FutureDashboardPlaceholder roleName="Teacher" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/office-staff/dashboard"
        element={
          <ProtectedRoute requireSchool={true} requireUser={true} allowedRoles={['OFFICE_STAFF']}>
            <FutureDashboardPlaceholder roleName="Office Staff" />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
