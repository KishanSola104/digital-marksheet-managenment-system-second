import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';

const AVAILABLE_ROLES = [
  { id: 'ADMIN', name: 'Admin' },
  { id: 'HEAD_TEACHER', name: 'Head Teacher' },
  { id: 'TEACHER', name: 'Teacher' },
  { id: 'OFFICE_STAFF', name: 'Office Staff' }
];

export default function UserLoginPage() {
  const navigate = useNavigate();
  const { school, loginUser, logoutSchool, isLoading: authLoading } = useAuth();

  const [role, setRole] = useState('ADMIN');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Guard: if no school session exists, redirect back to School Login
  useEffect(() => {
    if (!authLoading && !school) {
      navigate('/school-login', { replace: true });
    }
  }, [school, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userId.trim() || !password) {
      setError('Please provide your User ID and Password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginUser({
        userId: userId.trim().toUpperCase(),
        password,
        role
      });

      if (response.success && response.data) {
        if (response.data.mustChangePassword) {
          navigate('/user-change-password');
        } else {
          // Route according to role
          if (role === 'ADMIN') {
            navigate('/admin/dashboard');
          } else if (role === 'HEAD_TEACHER') {
            navigate('/head-teacher/dashboard');
          } else if (role === 'TEACHER') {
            navigate('/teacher/dashboard');
          } else if (role === 'OFFICE_STAFF') {
            navigate('/office-staff/dashboard');
          }
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check credentials or assigned role.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchSchool = async () => {
    await logoutSchool();
    navigate('/school-login');
  };

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <p className="text-sm text-gray-500">Checking school authorization session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-gray-200 p-8">
          
          {/* Active School Context Banner */}
          <div className="mb-6 p-3 bg-brand-50 border border-brand-200 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-brand-700 tracking-wider block">
                Active School Context
              </span>
              <p className="text-xs font-bold text-navy-900 truncate max-w-[200px]">
                {school.schoolName}
              </p>
              <span className="text-[11px] font-mono text-gray-500">{school.schoolId}</span>
            </div>
            <button
              type="button"
              onClick={handleSwitchSchool}
              className="text-xs text-brand-700 hover:text-brand-900 font-semibold underline"
            >
              Switch School
            </button>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-navy-900">User Login</h1>
            <p className="text-xs text-gray-500 mt-1">
              Step 2 of 2: Select your role and enter personal credentials
            </p>
          </div>

          <Alert type="error" message={error} onClose={() => setError('')} />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Select Your Role <span className="text-red-500">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md text-sm font-medium bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {AVAILABLE_ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                User ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value.toUpperCase())}
                placeholder="e.g. ADM-ABC-0001"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md text-sm font-mono uppercase focus:ring-2 focus:ring-brand-500 focus:outline-none"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <Link
                  to="/user-forgot-password"
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
                  Logging in...
                </>
              ) : (
                `Login as ${AVAILABLE_ROLES.find((r) => r.id === role)?.name || 'User'}`
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-500 space-y-1">
            <p>User accounts are strictly scoped to <span className="font-semibold text-gray-700">{school.schoolName}</span>.</p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
