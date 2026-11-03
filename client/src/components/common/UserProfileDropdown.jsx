import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAcademicYear } from '../../context/AcademicYearContext';

export default function UserProfileDropdown() {
  const { user, school, logoutUser } = useAuth();
  const { clearSelectedYear } = useAcademicYear();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    clearSelectedYear();
    await logoutUser();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 sm:px-2 sm:py-1.5 rounded-lg bg-navy-800 border border-navy-700 hover:bg-navy-750 text-white transition focus:outline-none focus:ring-2 focus:ring-brand-500"
        title="User Profile Menu"
      >
        <div className="w-8 h-8 rounded-md bg-brand-600 text-white font-bold text-xs flex items-center justify-center shadow-sm flex-shrink-0">
          {getInitials(user?.name)}
        </div>

        <div className="hidden lg:block text-left truncate max-w-[130px]">
          <p className="text-xs font-bold text-white truncate leading-tight">
            {user?.name || 'User'}
          </p>
          <p className="text-[10px] text-brand-200 uppercase font-semibold tracking-wider truncate">
            {user?.role || 'Staff'}
          </p>
        </div>

        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 hidden sm:block ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 sm:w-64 rounded-xl bg-white shadow-xl border border-gray-200 py-1.5 z-50 text-gray-800 text-xs sm:text-sm focus:outline-none animate-fadeIn">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-surface-50 rounded-t-xl">
            <p className="font-bold text-navy-900 text-sm truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-block bg-brand-100 text-brand-800 font-semibold px-2 py-0.5 rounded text-[10px] uppercase">
                {user?.role || 'User'}
              </span>
              <span className="text-[10px] font-mono text-gray-500 truncate">
                {user?.userId}
              </span>
            </div>
            {school && (
              <p className="text-[11px] text-gray-500 mt-1 truncate">
                <span className="font-semibold text-gray-700">{school.schoolName}</span>
              </p>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="w-full text-left px-4 py-2 flex items-center space-x-2.5 text-gray-700 hover:bg-gray-50 hover:text-brand-700 transition font-medium"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>My Profile</span>
            </Link>

            <Link
              to="/change-password"
              onClick={() => setIsOpen(false)}
              className="w-full text-left px-4 py-2 flex items-center space-x-2.5 text-gray-700 hover:bg-gray-50 hover:text-brand-700 transition font-medium"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Change Password</span>
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-1"></div>

          {/* Logout */}
          <div className="px-1 py-1">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 flex items-center space-x-2.5 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
            >
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
