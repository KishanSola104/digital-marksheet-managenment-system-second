import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Header />

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading, Description, CTA Buttons */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-brand-50 border border-brand-100 text-brand-700 px-3 py-1 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-brand-600"></span>
              <span>Next-Gen Academic ERP Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 tracking-tight leading-tight">
              Manage Your School Digitally with <span className="text-brand-600">DMMS</span>.
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
              The Digital Marksheet Management System empowers educational institutions with automated, tamper-proof academic record keeping, structured evaluation workflows, and instant marksheet verification.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                to="/school-login"
                className="inline-flex justify-center items-center px-6 py-3.5 border border-transparent text-base font-semibold rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 transition"
              >
                Get Started
                <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                to="/register-school"
                className="inline-flex justify-center items-center px-6 py-3.5 border border-gray-300 text-base font-semibold rounded-md text-navy-800 bg-white hover:bg-gray-50 shadow-sm transition"
              >
                Register New School
              </Link>
            </div>

            <p className="text-xs text-gray-500 pt-1">
              Existing institutions can directly log in with their School ID. New schools can complete self-registration in four simple steps.
            </p>

            {/* Quick feature highlights */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div>
                <p className="text-2xl font-bold text-navy-800">100%</p>
                <p className="text-xs text-gray-500">Tamper-Proof Records</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-800">4 Roles</p>
                <p className="text-xs text-gray-500">Admin, Teachers & Staff</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-800">Instant</p>
                <p className="text-xs text-gray-500">Digital Verification</p>
              </div>
            </div>
          </div>

          {/* Right Column: School ERP Illustration */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl border border-gray-100 relative">
              <div className="bg-navy-900 rounded-xl p-5 text-white mb-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">DMMS Console</span>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-navy-700 rounded w-3/4"></div>
                  <div className="h-3 bg-navy-800 rounded w-1/2"></div>
                </div>
              </div>

              {/* Mock School Cards */}
              <div className="space-y-3">
                <div className="p-3 bg-surface-50 rounded-lg border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                      SC
                    </div>
                    <div>
                      <p className="text-xs font-bold text-navy-900">Multi-School Architecture</p>
                      <p className="text-[11px] text-gray-500">Independent database isolation</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Active</span>
                </div>

                <div className="p-3 bg-surface-50 rounded-lg border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      RB
                    </div>
                    <div>
                      <p className="text-xs font-bold text-navy-900">Role-Based Access</p>
                      <p className="text-[11px] text-gray-500">Admin, Head Teacher, Teacher, Staff</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">Secure</span>
                </div>

                <div className="p-3 bg-surface-50 rounded-lg border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      MS
                    </div>
                    <div>
                      <p className="text-xs font-bold text-navy-900">Automated Marksheets</p>
                      <p className="text-[11px] text-gray-500">Accurate grading & evaluation</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">Verified</span>
                </div>
              </div>

              <div className="mt-5 text-center">
                <p className="text-xs text-gray-400">Ready to modernize your academic records?</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
