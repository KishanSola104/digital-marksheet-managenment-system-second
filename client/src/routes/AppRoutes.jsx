import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

// Phase 1 Public & Auth Pages
import HomePage from '../pages/HomePage';
import SchoolRegisterPage from '../pages/SchoolRegisterPage';
import SchoolLoginPage from '../pages/SchoolLoginPage';
import UserLoginPage from '../pages/UserLoginPage';
import ChangePasswordPage from '../pages/ChangePasswordPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';

// Phase 2 Role Dashboards
import AdminDashboard from '../pages/admin/AdminDashboard';
import HeadTeacherDashboard from '../pages/headTeacher/HeadTeacherDashboard';
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import OfficeStaffDashboard from '../pages/officeStaff/OfficeStaffDashboard';

// Phase 2 Modules & Common Pages
import ManageUsers from '../pages/admin/ManageUsers';
import MyProfile from '../pages/common/MyProfile';
import ChangePassword from '../pages/common/ChangePassword';

// Task 3 Administrative Setup Modules
import AcademicYearManagement from '../pages/admin/AcademicYearManagement';
import ClassManagement from '../pages/admin/ClassManagement';
import SectionManagement from '../pages/admin/SectionManagement';
import SubjectManagement from '../pages/admin/SubjectManagement';

// Role-based Dashboard Redirector for generic /dashboard path
function RoleDashboardRedirect() {
  const { user } = useAuth();
  const role = user?.role || 'ADMIN';

  if (role === 'HEAD_TEACHER') return <Navigate to="/head-teacher/dashboard" replace />;
  if (role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
  if (role === 'OFFICE_STAFF') return <Navigate to="/office-staff/dashboard" replace />;
  return <Navigate to="/admin/dashboard" replace />;
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

      {/* Forced User Password Change on First Login */}
      <Route
        path="/user-change-password"
        element={
          <ProtectedRoute requireSchool={true} requireUser={true}>
            <ChangePasswordPage type="user" />
          </ProtectedRoute>
        }
      />

      {/* Generic /dashboard redirect */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireSchool={true} requireUser={true}>
            <RoleDashboardRedirect />
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requireSchool={true} requireUser={true} allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Manage Users */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requireSchool={true} requireUser={true} allowedRoles={['ADMIN']}>
            <ManageUsers />
          </ProtectedRoute>
        }
      />

      {/* Task 3: Academic Year Management */}
      <Route
        path="/admin/academic-years"
        element={
          <ProtectedRoute requireSchool={true} requireUser={true} allowedRoles={['ADMIN']}>
            <AcademicYearManagement />
          </ProtectedRoute>
        }
      />

      {/* Task 3: Class Management */}
      <Route
        path="/admin/classes"
        element={
          <ProtectedRoute requireSchool={true} requireUser={true} allowedRoles={['ADMIN']}>
            <ClassManagement />
          </ProtectedRoute>
        }
      />

      {/* Task 3: Section Management */}
      <Route
        path="/admin/sections"
        element={
          <ProtectedRoute requireSchool={true} requireUser={true} allowedRoles={['ADMIN']}>
            <SectionManagement />
          </ProtectedRoute>
        }
      />

      {/* Task 3: Subject Management */}
      <Route
        path="/admin/subjects"
        element={
          <ProtectedRoute requireSchool={true} requireUser={true} allowedRoles={['ADMIN']}>
            <SubjectManagement />
          </ProtectedRoute>
        }
      />

      {/* Head Teacher Dashboard */}
      <Route
        path="/head-teacher/dashboard"
        element={
          <ProtectedRoute requireSchool={true} requireUser={true} allowedRoles={['HEAD_TEACHER']}>
            <HeadTeacherDashboard />
          </ProtectedRoute>
        }
      />

      {/* Teacher Dashboard */}
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute requireSchool={true} requireUser={true} allowedRoles={['TEACHER']}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      {/* Office Staff Dashboard */}
      <Route
        path="/office-staff/dashboard"
        element={
          <ProtectedRoute requireSchool={true} requireUser={true} allowedRoles={['OFFICE_STAFF']}>
            <OfficeStaffDashboard />
          </ProtectedRoute>
        }
      />

      {/* Common My Profile (All Roles) */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute requireSchool={true} requireUser={true}>
            <MyProfile />
          </ProtectedRoute>
        }
      />

      {/* Common Change Password (All Roles) */}
      <Route
        path="/change-password"
        element={
          <ProtectedRoute requireSchool={true} requireUser={true}>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
