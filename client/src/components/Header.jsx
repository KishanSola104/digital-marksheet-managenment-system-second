import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { school, user, logoutSchool, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleSchoolLogout = async () => {
    await logoutSchool();
    navigate('/school-login');
  };

  const handleUserLogout = async () => {
    await logoutUser();
    navigate('/user-login');
  };

  return (
    <header className="bg-navy-900 text-white shadow-md border-b border-navy-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-xl text-white shadow-sm group-hover:bg-brand-500 transition">
            DM
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white block leading-tight">
              DMMS
            </span>
            <span className="text-xs text-brand-100 font-medium block">
              Digital Marksheet Management
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center space-x-3">
          {/* Active School Session Badge */}
          {school && (
            <div className="hidden md:flex items-center space-x-2 bg-navy-800/80 px-3 py-1.5 rounded-md border border-navy-700 text-xs text-gray-200">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-semibold text-white">{school.schoolName || school.schoolId}</span>
              <span className="text-gray-400">({school.schoolId})</span>
            </div>
          )}

          {/* User Logged In */}
          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                to="/dashboard"
                className="text-xs sm:text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 rounded-md transition"
              >
                Dashboard
              </Link>
              <button
                onClick={handleUserLogout}
                className="text-xs sm:text-sm text-gray-300 hover:text-white px-2 py-1 rounded transition"
                title="Logout User"
              >
                Logout User
              </button>
            </div>
          ) : school ? (
            /* School Session Active, but no user logged in */
            <div className="flex items-center space-x-2">
              <Link
                to="/user-login"
                className="text-xs sm:text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 rounded-md transition"
              >
                User Login
              </Link>
              <button
                onClick={handleSchoolLogout}
                className="text-xs sm:text-sm text-gray-300 hover:text-white px-2 py-1 rounded transition"
                title="End School Session"
              >
                Switch School
              </button>
            </div>
          ) : (
            /* Guest / Public Navigation */
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link
                to="/school-login"
                className="text-xs sm:text-sm font-semibold text-gray-200 hover:text-white px-3 py-2 rounded-md transition hover:bg-navy-800"
              >
                Login
              </Link>
              <Link
                to="/register-school"
                className="text-xs sm:text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-md shadow-sm transition"
              >
                Register School
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
