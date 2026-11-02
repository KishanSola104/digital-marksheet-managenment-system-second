import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Alert from '../components/Alert';
import authService from '../services/authService';

export default function ResetPasswordPage({ type = 'school' }) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const isSchool = type === 'school';
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Password reset token is missing from the URL.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Both password fields are required.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      let res;
      if (isSchool) {
        res = await authService.resetSchoolPassword(token, newPassword);
      } else {
        res = await authService.resetUserPassword(token, newPassword);
      }
      setSuccess(res.message || 'Password successfully reset! Redirecting to login...');
      setTimeout(() => {
        navigate(isSchool ? '/school-login' : '/user-login');
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to reset password. Token may be expired.';
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
          
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-navy-900">
              Reset {isSchool ? 'School' : 'User'} Password
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Create a new secure permanent password for your account
            </p>
          </div>

          <Alert type="error" message={error} onClose={() => setError('')} />
          <Alert type="success" message={success} />

          {!token && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 mb-4">
              Invalid access: No reset token detected in URL. Please click the reset link in your email.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full mt-2 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-md shadow-sm transition flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? 'Resetting Password...' : 'Save New Password'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
            <Link
              to={isSchool ? '/school-login' : '/user-login'}
              className="text-brand-600 hover:text-brand-800 font-semibold"
            >
              &larr; Return to {isSchool ? 'School Login' : 'User Login'}
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
