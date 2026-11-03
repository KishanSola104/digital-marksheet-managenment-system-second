import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { useAcademicYear } from '../../context/AcademicYearContext';

export default function OfficeStaffDashboard() {
  const { user, school } = useAuth();
  const { selectedYear } = useAcademicYear();

  return (
    <MainLayout>
      {/* Welcome Banner */}
      <div className="bg-navy-900 rounded-2xl p-6 sm:p-8 text-white shadow-md border border-navy-800 mb-8">
        <div className="inline-flex items-center space-x-2 bg-brand-600/30 border border-brand-400/30 text-brand-200 px-3 py-1 rounded-full text-xs font-semibold mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Office Staff Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Welcome, {user?.name || 'Staff Member'}!
        </h1>
        <p className="text-sm text-gray-300 mt-1">
          Administrative & Office Staff at <span className="font-semibold text-white">{school?.schoolName || user?.schoolName || 'Your School'}</span>
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

      {/* Role Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-navy-900">Office Staff Overview</h2>
            <span className="text-xs font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded">
              Role: OFFICE_STAFF
            </span>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-gray-500 uppercase font-semibold">Staff Name</span>
              <p className="font-bold text-navy-900">{user?.name}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase font-semibold">Staff User ID</span>
              <p className="font-mono font-bold text-gray-800">{user?.userId}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase font-semibold">Email Address</span>
              <p className="text-gray-700">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-navy-900">Administrative Records Module</h2>
            <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
              Future Modules
            </span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Student record administration, enrollment verification, document printing, and archiving will be configured in subsequent phases.
          </p>
          <div className="pt-2 flex items-center space-x-3">
            <Link
              to="/profile"
              className="inline-flex items-center text-xs font-semibold text-brand-600 hover:text-brand-800"
            >
              <span>Manage Profile</span>
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
