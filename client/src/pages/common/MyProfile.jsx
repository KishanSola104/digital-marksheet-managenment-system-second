import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import profileService from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';

export default function MyProfile() {
  const { updateUserState } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Editing state for Full Name
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError('');
        const res = await profileService.getProfile();
        if (res.success && res.data) {
          setProfile(res.data);
          setName(res.data.personal?.name || '');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Full Name is required.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccessMsg('');
      const res = await profileService.updateProfile({ name: name.trim() });
      if (res.success && res.data) {
        setProfile(res.data);
        setName(res.data.personal?.name || name);
        setIsEditing(false);
        setSuccessMsg('Profile name updated successfully.');
        // Update user state in AuthContext
        updateUserState({ name: name.trim() });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (roleId) => {
    switch (roleId) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'HEAD_TEACHER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TEACHER':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'OFFICE_STAFF':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">My Profile</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              View your institutional profile, employee credentials, and personal details.
            </p>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-sm transition"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Name
            </button>
          )}
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs sm:text-sm flex items-center justify-between">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-700 font-bold">✕</button>
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs sm:text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-700 font-bold">✕</button>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent mb-2"></div>
            <p className="text-sm">Loading profile details...</p>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Card 1: Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-surface-100/70 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
                  Personal Information
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRoleBadge(profile.personal?.primaryRole)}`}>
                  {profile.personal?.primaryRole}
                </span>
              </div>

              <div className="p-6">
                {isEditing ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                      <p className="text-[11px] text-gray-400 mt-1">
                        Updating your name synchronizes your authentication account and employee record.
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-sm transition disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Name'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setName(profile.personal?.name || '');
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs sm:text-sm font-semibold transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
                    <div>
                      <span className="text-xs text-gray-500 uppercase font-semibold">User ID (Permanent)</span>
                      <p className="font-mono font-bold text-navy-900 text-base mt-0.5">
                        {profile.personal?.userId}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs text-gray-500 uppercase font-semibold">Full Name</span>
                      <p className="font-bold text-navy-900 text-base mt-0.5">
                        {profile.personal?.name}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs text-gray-500 uppercase font-semibold">Email Address (Read-only)</span>
                      <p className="font-medium text-gray-700 mt-0.5">
                        {profile.personal?.email}
                      </p>
                      <span className="text-[10px] text-gray-400">Contact Admin for email updates</span>
                    </div>

                    <div>
                      <span className="text-xs text-gray-500 uppercase font-semibold">Mobile Number (Read-only)</span>
                      <p className="font-medium text-gray-700 mt-0.5">
                        {profile.personal?.mobile}
                      </p>
                      <span className="text-[10px] text-gray-400">Contact Admin for mobile updates</span>
                    </div>

                    <div>
                      <span className="text-xs text-gray-500 uppercase font-semibold">Account Status</span>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${profile.personal?.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${profile.personal?.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          {profile.personal?.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-gray-500 uppercase font-semibold">Assigned Role(s)</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {profile.personal?.roles?.map((r) => (
                          <span key={r} className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded text-xs font-semibold">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Institution Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-surface-100/70 border-b border-gray-200">
                <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
                  School / Institutional Details
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold">School Name</span>
                  <p className="font-bold text-navy-900 text-base mt-0.5">
                    {profile.school?.schoolName || 'N/A'}
                  </p>
                </div>

                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold">School ID</span>
                  <p className="font-mono font-bold text-gray-800 text-base mt-0.5">
                    {profile.school?.schoolId}
                  </p>
                </div>

                {profile.school?.schoolEmail && (
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-semibold">Official School Email</span>
                    <p className="text-gray-700 mt-0.5">{profile.school.schoolEmail}</p>
                  </div>
                )}

                {(profile.school?.district || profile.school?.state) && (
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-semibold">Location</span>
                    <p className="text-gray-700 mt-0.5">
                      {[profile.school?.district, profile.school?.state].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Card 3: Employee Details */}
            {profile.employee && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-surface-100/70 border-b border-gray-200">
                  <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
                    Employee Profile Details
                  </h2>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-semibold">Employee Name</span>
                    <p className="font-semibold text-gray-800 mt-0.5">{profile.employee.employeeName}</p>
                  </div>

                  <div>
                    <span className="text-xs text-gray-500 uppercase font-semibold">Designation / Employee Type</span>
                    <p className="font-semibold text-brand-700 mt-0.5">{profile.employee.employeeType}</p>
                  </div>

                  <div>
                    <span className="text-xs text-gray-500 uppercase font-semibold">Enrolled On</span>
                    <p className="text-gray-700 mt-0.5">
                      {new Date(profile.employee.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
}
