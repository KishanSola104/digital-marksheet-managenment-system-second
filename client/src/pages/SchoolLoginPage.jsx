import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';

export default function SchoolLoginPage() {
  const navigate = useNavigate();
  const { loginSchool } = useAuth();

  const [schoolId, setSchoolId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!schoolId.trim() || !password) {
      setError('Please provide both School ID and School Password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginSchool(schoolId.trim().toUpperCase(), password);
      if (response.success && response.data) {
        // If mandatory password change is flag-marked
        if (response.data.mustChangePassword) {
          navigate('/school-change-password');
        } else {
          // Navigate to User Login to select role and enter personal credentials
          navigate('/user-login');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-gray-200 p-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 text-brand-700 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-navy-900">School Portal Login</h1>
            <p className="text-xs text-gray-500 mt-1">
              Step 1 of 2: Authenticate your institution to access user logins
            </p>
          </div>

          <Alert type="error" message={error} onClose={() => setError('')} />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                School ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value.toUpperCase())}
                placeholder="e.g. DMMS-ABC-000001"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md text-sm font-mono uppercase focus:ring-2 focus:ring-brand-500 focus:outline-none"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700">
                  School Password <span className="text-red-500">*</span>
                </label>
                <Link
                  to="/school-forgot-password"
                  className="text-xs text-brand-600 hover:text-brand-800 font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-md shadow-sm transition flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                'Authenticate School'
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
            <span>New school? </span>
            <Link to="/register-school" className="text-brand-600 hover:text-brand-800 font-semibold">
              Register your School here
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
