import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { useAcademicYear } from '../../context/AcademicYearContext';
import dashboardService from '../../services/dashboardService';

export default function AdminDashboard() {
  const { user, school } = useAuth();
  const { selectedYear } = useAcademicYear();

  const [summary, setSummary] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalAcademicYears: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        const res = await dashboardService.getSummary();
        if (res.success && res.data) {
          setSummary(res.data);
        }
      } catch (err) {
        // fallback to default
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  return (
    <MainLayout>
      {/* Welcome Banner */}
      <div className="bg-navy-900 rounded-2xl p-6 sm:p-8 text-white shadow-md border border-navy-800 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-brand-600/30 border border-brand-400/30 text-brand-200 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Administrator Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'Administrator'}!
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            You are managing <span className="font-semibold text-white">{school?.schoolName || user?.schoolName || 'Your School'}</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-brand-100">
            <span className="bg-navy-800 px-2.5 py-1 rounded-md border border-navy-700">
              School ID: <strong className="text-white font-mono">{school?.schoolId || user?.schoolId}</strong>
            </span>
            <span className="bg-navy-800 px-2.5 py-1 rounded-md border border-navy-700">
              User ID: <strong className="text-white font-mono">{user?.userId}</strong>
            </span>
            {selectedYear && (
              <span className="bg-brand-700/60 px-2.5 py-1 rounded-md border border-brand-500/40 text-brand-100">
                Academic Year: <strong className="text-white">{selectedYear.yearName}</strong>
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/admin/users"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-sm transition"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Manage Users
          </Link>
          <Link
            to="/profile"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-navy-800 hover:bg-navy-750 text-gray-200 hover:text-white rounded-lg text-xs sm:text-sm font-semibold border border-navy-700 transition"
          >
            View Profile
          </Link>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Total Users */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mt-1">
              {loading ? '...' : summary.totalUsers}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Enrolled institutional accounts</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Active Users</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
              {loading ? '...' : summary.activeUsers}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Able to authenticate & access</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Inactive Users */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Inactive Users</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
              {loading ? '...' : summary.inactiveUsers}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Suspended or disabled accounts</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
        </div>

        {/* Total Academic Years */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Academic Years</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mt-1">
              {loading ? '...' : summary.totalAcademicYears}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Configured academic sessions</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module Card 1: User Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded">
                Phase 2 Core Module
              </span>
            </div>
            <h3 className="text-base font-bold text-navy-900">Manage School Staff & Users</h3>
            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
              Create and manage institutional user accounts for Head Teachers, Teachers, and Office Staff.
              Automatically generates system User IDs, strong temporary passwords, and handles role assignments.
            </p>
          </div>
          <div className="mt-6">
            <Link
              to="/admin/users"
              className="inline-flex items-center text-xs font-bold text-brand-600 hover:text-brand-800"
            >
              <span>Open Manage Users</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Module Card 2: Security & Profile */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2 py-0.5 rounded">
                Account Settings
              </span>
            </div>
            <h3 className="text-base font-bold text-navy-900">Profile & Password Management</h3>
            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
              View your institutional profile, employee designation, and update your personal security credentials.
            </p>
          </div>
          <div className="mt-6 flex items-center space-x-4">
            <Link
              to="/profile"
              className="inline-flex items-center text-xs font-bold text-brand-600 hover:text-brand-800"
            >
              <span>My Profile</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              to="/change-password"
              className="inline-flex items-center text-xs font-bold text-brand-600 hover:text-brand-800"
            >
              <span>Change Password</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
