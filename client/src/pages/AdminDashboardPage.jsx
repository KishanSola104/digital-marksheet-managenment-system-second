import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, school, logoutUser } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/user-login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Welcome Banner */}
        <div className="bg-navy-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-navy-800">
          <div>
            <div className="inline-flex items-center space-x-2 bg-brand-600/30 border border-brand-400/30 text-brand-200 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Administrator Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {user?.name || 'Administrator'}!
            </h1>
            <p className="text-sm text-gray-300 mt-1">
              You are signed into <span className="font-semibold text-white">{school?.schoolName || user?.schoolName || 'Your School'}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs sm:text-sm font-semibold shadow-sm transition flex items-center"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

        {/* Admin & School Context Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Card 1: Administrator Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-navy-900">Administrator Profile</h2>
              <span className="text-xs font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded">
                Role: ADMIN
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-gray-500 uppercase font-semibold">Admin Name</span>
                <p className="font-bold text-navy-900">{user?.name || 'N/A'}</p>
              </div>

              <div>
                <span className="text-xs text-gray-500 uppercase font-semibold">Admin User ID</span>
                <p className="font-mono font-bold text-gray-800 text-base">{user?.userId || 'N/A'}</p>
              </div>

              <div>
                <span className="text-xs text-gray-500 uppercase font-semibold">Email Address</span>
                <p className="text-gray-700">{user?.email || 'N/A'}</p>
              </div>

              {user?.isPrimaryAdmin && (
                <div className="inline-block bg-emerald-50 text-emerald-800 text-xs font-semibold px-2 py-1 rounded border border-emerald-200">
                  Primary School Administrator
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Institution Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-navy-900">Institutional Context</h2>
              <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                Verified School
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-gray-500 uppercase font-semibold">School Name</span>
                <p className="font-bold text-navy-900">{school?.schoolName || user?.schoolName || 'N/A'}</p>
              </div>

              <div>
                <span className="text-xs text-gray-500 uppercase font-semibold">Assigned School ID</span>
                <p className="font-mono font-bold text-gray-800 text-base">{school?.schoolId || user?.schoolId || 'N/A'}</p>
              </div>

              <div>
                <span className="text-xs text-gray-500 uppercase font-semibold">Official School Email</span>
                <p className="text-gray-700">{school?.schoolEmail || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Roadmap Notice */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-6 text-sm text-brand-900">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs mt-0.5">
              T1
            </div>
            <div>
              <h3 className="font-bold text-navy-900">Task 1: School Registration & Authentication Verified</h3>
              <p className="text-xs text-gray-600 mt-1">
                You have successfully authenticated through both tiers (School Portal Session & Admin Personal Authentication).
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Subsequent modules (Teacher Management, Classes & Sections, Subjects, Exam Evaluations, and Digital Marksheets) will be incrementally unlocked in future tasks.
              </p>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
