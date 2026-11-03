import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AcademicYearSelector from '../common/AcademicYearSelector';
import NotificationDropdown from '../common/NotificationDropdown';
import UserProfileDropdown from '../common/UserProfileDropdown';

export default function LayoutHeader({ onToggleSidebar, isSidebarOpen }) {
  const { school, user } = useAuth();

  const schoolDisplayName = school?.schoolName || user?.schoolName || 'School ERP';
  const role = user?.role || 'ADMIN';

  // Role dashboard URL
  const dashboardUrl =
    role === 'ADMIN'
      ? '/admin/dashboard'
      : role === 'HEAD_TEACHER'
      ? '/head-teacher/dashboard'
      : role === 'TEACHER'
      ? '/teacher/dashboard'
      : '/office-staff/dashboard';

  return (
    <header className="bg-navy-900 text-white shadow-md border-b border-navy-800 sticky top-0 z-30 h-16">
      <div className="h-full px-3 sm:px-6 flex items-center justify-between">
        {/* Left Section: Mobile Toggle & DMMS Branding */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg bg-navy-800 text-gray-200 hover:text-white hover:bg-navy-750 focus:outline-none focus:ring-2 focus:ring-brand-500 lg:hidden"
            title="Toggle Sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link to={dashboardUrl} className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center font-extrabold text-lg text-white shadow-sm group-hover:bg-brand-500 transition">
              DM
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-white block leading-tight">
                DMMS
              </span>
              <span className="text-[10px] sm:text-xs text-brand-200 font-medium block truncate max-w-[140px] sm:max-w-none">
                Digital Marksheet Management System
              </span>
            </div>
          </Link>
        </div>

        {/* Right Section: School Name -> Academic Year -> Notification -> User Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* 1. Current School Name */}
          <div className="hidden md:flex items-center space-x-1.5 bg-navy-800/90 border border-navy-700/80 px-3 py-1.5 rounded-lg max-w-[200px] lg:max-w-[260px] truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse"></span>
            <span className="text-xs font-semibold text-white truncate" title={schoolDisplayName}>
              {schoolDisplayName}
            </span>
          </div>

          {/* 2. Academic Year Dropdown */}
          <AcademicYearSelector />

          {/* 3. Notification Icon */}
          <NotificationDropdown />

          {/* 4. User Profile Icon */}
          <UserProfileDropdown />
        </div>
      </div>
    </header>
  );
}
