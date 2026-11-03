import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAcademicYear } from '../../context/AcademicYearContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logoutUser } = useAuth();
  const { clearSelectedYear } = useAcademicYear();
  const navigate = useNavigate();
  const location = useLocation();

  const role = user?.role || 'ADMIN';

  // State for expandable accordions
  const [isAdminSetupOpen, setIsAdminSetupOpen] = useState(true);
  const [isClassesSubmenuOpen, setIsClassesSubmenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(
    location.pathname === '/profile' || location.pathname === '/change-password'
  );

  const handleLogout = async () => {
    clearSelectedYear();
    await logoutUser();
    navigate('/');
  };

  // Role dashboard URL
  const dashboardUrl =
    role === 'ADMIN'
      ? '/admin/dashboard'
      : role === 'HEAD_TEACHER'
      ? '/head-teacher/dashboard'
      : role === 'TEACHER'
      ? '/teacher/dashboard'
      : '/office-staff/dashboard';

  const linkClass = ({ isActive }) =>
    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition ${
      isActive
        ? 'bg-brand-600 text-white shadow-sm'
        : 'text-gray-300 hover:bg-navy-800 hover:text-white'
    }`;

  const sublinkClass = ({ isActive }) =>
    `flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition ${
      isActive
        ? 'bg-brand-600/80 text-white font-semibold'
        : 'text-gray-300 hover:bg-navy-800 hover:text-white'
    }`;

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-navy-900 border-r border-navy-800 text-gray-200">
      {/* Top Section */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* User Role Tag */}
        <div className="px-3 py-2 rounded-lg bg-navy-800/80 border border-navy-700/60 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Active Role</p>
            <p className="text-xs font-bold text-white">{role}</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {/* Dashboard */}
          <NavLink to={dashboardUrl} className={linkClass} onClick={onClose}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Dashboard</span>
          </NavLink>

          {/* ADMIN: Administrative Setup */}
          {role === 'ADMIN' && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsAdminSetupOpen(!isAdminSetupOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-300 hover:bg-navy-800 hover:text-white transition"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Administrative Setup</span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${isAdminSetupOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isAdminSetupOpen && (
                <div className="pl-6 pr-1 py-1 space-y-1">
                  {/* Manage Users (Functional) */}
                  <NavLink to="/admin/users" className={sublinkClass} onClick={onClose}>
                    <span>Manage Users</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                      Active
                    </span>
                  </NavLink>

                  {/* Manage Academic Year (Future) */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-md text-xs text-gray-500 cursor-not-allowed">
                    <span>Manage Academic Year</span>
                    <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">
                      Future
                    </span>
                  </div>

                  {/* Manage Classes with Submenu (Future) */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsClassesSubmenuOpen(!isClassesSubmenuOpen)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs text-gray-400 hover:text-gray-300"
                    >
                      <span>Manage Classes</span>
                      <svg
                        className={`w-3.5 h-3.5 transition-transform ${isClassesSubmenuOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isClassesSubmenuOpen && (
                      <div className="pl-4 py-1 space-y-1">
                        <div className="flex items-center justify-between px-3 py-1.5 text-xs text-gray-500 cursor-not-allowed">
                          <span>Manage Classes</span>
                          <span className="text-[9px] bg-gray-800 text-gray-400 px-1 py-0.5 rounded">
                            Future
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-1.5 text-xs text-gray-500 cursor-not-allowed">
                          <span>Manage Sections</span>
                          <span className="text-[9px] bg-gray-800 text-gray-400 px-1 py-0.5 rounded">
                            Future
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Manage Subjects (Future) */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-md text-xs text-gray-500 cursor-not-allowed">
                    <span>Manage Subjects</span>
                    <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">
                      Future
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Common Settings Section */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-300 hover:bg-navy-800 hover:text-white transition"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span>Settings</span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isSettingsOpen && (
              <div className="pl-6 pr-1 py-1 space-y-1">
                <NavLink to="/profile" className={sublinkClass} onClick={onClose}>
                  <span>My Profile</span>
                </NavLink>
                <NavLink to="/change-password" className={sublinkClass} onClick={onClose}>
                  <span>Change Password</span>
                </NavLink>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Bottom Section: Logout */}
      <div className="p-3 border-t border-navy-800">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition"
        >
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-[calc(100vh-4rem)] sticky top-16 z-20 flex-shrink-0 shadow-sm">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-72 bg-navy-900 shadow-2xl z-50 transform transition-transform ease-in-out duration-300 flex flex-col">
            <div className="p-4 border-b border-navy-800 flex items-center justify-between">
              <span className="font-bold text-white text-sm">Navigation Menu</span>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-navy-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">{sidebarContent}</div>
          </div>
        </div>
      )}
    </>
  );
}
