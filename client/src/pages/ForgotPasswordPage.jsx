import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Alert from '../components/Alert';
import authService from '../services/authService';

export default function ForgotPasswordPage({ type = 'school' }) {
  const isSchool = type === 'school';
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!identifier.trim()) {
      setError(isSchool ? 'Please enter your registered School Email.' : 'Please enter your User ID or Email.');
      return;
    }

    setIsLoading(true);
    try {
      let res;
      if (isSchool) {
        res = await authService.forgotSchoolPassword(identifier.trim());
      } else {
        res = await authService.forgotUserPassword(null, identifier.trim());
      }
      setSuccess(
        res.message || 'If an account matches your details, password reset instructions have been dispatched.'
      );
    } catch (err) {
      // Avoid leaking account existence info
      setSuccess('If an account matches your details, password reset instructions have been dispatched.');
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
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-brand-600 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-navy-900">
              {isSchool ? 'School Password Reset' : 'User Password Reset'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {isSchool
                ? 'Enter your school registered official email address'
                : 'Enter your User ID or registered email address'}
            </p>
          </div>

          <Alert type="error" message={error} onClose={() => setError('')} />
          <Alert type="success" message={success} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {isSchool ? 'School Official Email' : 'User ID or Email'} <span className="text-red-500">*</span>
              </label>
              <input
                type={isSchool ? 'email' : 'text'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={isSchool ? 'principal@school.edu' : 'ADM-XXX-0001 or email@domain.com'}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
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
                  Sending Instructions...
                </>
              ) : (
                'Request Reset Link'
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
            <Link
              to={isSchool ? '/school-login' : '/user-login'}
              className="text-brand-600 hover:text-brand-800 font-semibold"
            >
              &larr; Back to {isSchool ? 'School Login' : 'User Login'}
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
