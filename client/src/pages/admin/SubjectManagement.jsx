import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import subjectService from '../../services/subjectService';

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters & Pagination State
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    totalRecords: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 10
  });

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    subjectName: '',
    subjectCode: '',
    subjectType: 'ACADEMIC'
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch Subjects
  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page: currentPage,
        limit: recordsPerPage
      };
      if (categoryFilter) params.category = categoryFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== '') params.status = statusFilter;

      const res = await subjectService.getSubjects(params);
      if (res.success && res.data) {
        setSubjects(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load subjects.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, recordsPerPage, categoryFilter, searchTerm, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubjects();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchSubjects]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormData({
      subjectName: '',
      subjectCode: '',
      subjectType: categoryFilter === 'CO_CURRICULAR' ? 'CO_CURRICULAR' : 'ACADEMIC'
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (sub) => {
    setSelectedSubject(sub);
    setFormData({
      subjectName: sub.subjectName || '',
      subjectCode: sub.subjectCode || '',
      subjectType: sub.subjectType || 'ACADEMIC'
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  // Handle Add Submission
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    try {
      const res = await subjectService.createSubject(formData);
      if (res.success) {
        setIsAddModalOpen(false);
        setSuccessMsg(res.message || 'Subject created successfully.');
        fetchSubjects();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create subject.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Edit Submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    try {
      const res = await subjectService.updateSubject(selectedSubject._id, formData);
      if (res.success) {
        setIsEditModalOpen(false);
        setSuccessMsg(res.message || 'Subject updated successfully.');
        fetchSubjects();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update subject.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Status Toggle (Activate / Deactivate)
  const handleToggleStatus = async (sub) => {
    const action = sub.isActive ? 'deactivate' : 'activate';
    const confirmText = `Are you sure you want to ${action} Subject '${sub.subjectName}'?`;
    if (!window.confirm(confirmText)) return;

    try {
      const res = await subjectService.updateSubjectStatus(sub._id, !sub.isActive);
      if (res.success) {
        setSuccessMsg(res.message);
        fetchSubjects();
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} subject.`);
    }
  };

  // Category Badge Helper
  const getCategoryBadge = (type) => {
    if (type === 'CO_CURRICULAR') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
          Co-Curricular
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
        Academic
      </span>
    );
  };

  return (
    <MainLayout>
      {/* Breadcrumbs */}
      <nav className="mb-4 flex items-center space-x-2 text-xs text-gray-500">
        <Link to="/admin/dashboard" className="hover:text-brand-600 transition">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-gray-400">Administrative Setup</span>
        <span>/</span>
        <span className="font-semibold text-navy-900">Subject Management</span>
      </nav>

      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Subject Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage the school&apos;s subjects. Subjects can be Academic or Co-Curricular.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-sm transition flex-shrink-0"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Subject
        </button>
      </div>

      {/* Informational Banner */}
      <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 text-emerald-900">
        <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <div className="text-xs sm:text-sm">
          <p className="font-semibold text-emerald-950">Subject Classification Categories</p>
          <p className="text-emerald-800 mt-0.5">
            Subjects are categorized strictly as <strong>Academic</strong> (core graded curriculum) or <strong>Co-Curricular</strong> (arts, sports, holistic assessments).
            This structure enables accurate marksheet computation in evaluation modules.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900 text-xs">✕</button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs sm:text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900 text-xs">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white font-medium"
            >
              <option value="">All Categories</option>
              <option value="ACADEMIC">Academic Subjects</option>
              <option value="CO_CURRICULAR">Co-Curricular Subjects</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by Subject Name or Code (e.g. Mathematics, MATH101)..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Status & Show */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Status & Show
            </label>
            <div className="flex items-center space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
              >
                <option value="">All Statuses</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>

              <select
                value={recordsPerPage}
                onChange={(e) => {
                  setRecordsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-2 border border-gray-300 rounded-lg bg-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                title="Records per page"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-navy-900 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-16">S.No.</th>
                <th className="py-3.5 px-4">Subject Name</th>
                <th className="py-3.5 px-4">Subject Code</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {loading && subjects.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-brand-500 border-t-transparent mb-2"></div>
                    <p>Loading subjects...</p>
                  </td>
                </tr>
              ) : subjects.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-gray-500 font-semibold">No subjects found</p>
                    <p className="text-gray-400 text-xs mt-0.5">Click &quot;Add Subject&quot; to configure your curriculum.</p>
                  </td>
                </tr>
              ) : (
                subjects.map((sub, index) => {
                  const serialNum = (pagination.currentPage - 1) * pagination.limit + index + 1;
                  return (
                    <tr key={sub._id} className="hover:bg-gray-50/80 transition">
                      {/* S.No. */}
                      <td className="py-3 px-4 text-gray-500 font-mono text-xs">{serialNum}</td>

                      {/* Subject Name */}
                      <td className="py-3 px-4 font-bold text-navy-900">{sub.subjectName}</td>

                      {/* Subject Code */}
                      <td className="py-3 px-4 font-mono font-semibold text-gray-700">{sub.subjectCode}</td>

                      {/* Category */}
                      <td className="py-3 px-4">{getCategoryBadge(sub.subjectType)}</td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {sub.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(sub)}
                          className="px-2.5 py-1 text-[11px] font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded transition"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(sub)}
                          className={`px-2.5 py-1 text-[11px] font-medium rounded border transition ${
                            sub.isActive
                              ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                          }`}
                        >
                          {sub.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.totalRecords > 0 && (
          <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-gray-600">
            <div>
              Showing {Math.min((pagination.currentPage - 1) * pagination.limit + 1, pagination.totalRecords)} to{' '}
              {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of {pagination.totalRecords} entries
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={pagination.currentPage <= 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCurrentPage(num)}
                  className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm transition ${
                    pagination.currentPage === num
                      ? 'bg-brand-600 text-white border-brand-600 font-semibold'
                      : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, pagination.totalPages))}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Subject Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 p-6 relative animate-fadeIn">
            <h2 className="text-lg font-bold text-navy-900 mb-1">Add New Subject</h2>
            <p className="text-xs text-gray-500 mb-4">
              Add a subject to your school catalog under Academic or Co-Curricular.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Subject Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.subjectName}
                  onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                  placeholder="e.g. Mathematics, English, Drawing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Subject Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.subjectCode}
                  onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                  placeholder="e.g. MATH101, ENG01, ART01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.subjectType}
                  onChange={(e) => setFormData({ ...formData, subjectType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white font-medium"
                >
                  <option value="ACADEMIC">Academic</option>
                  <option value="CO_CURRICULAR">Co-Curricular</option>
                </select>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Academic subjects are core curriculum; Co-Curricular include physical education, arts, etc.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={formSubmitting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 p-6 relative animate-fadeIn">
            <h2 className="text-lg font-bold text-navy-900 mb-1">Edit Subject</h2>
            <p className="text-xs text-gray-500 mb-4">
              Update subject details and classification. Historical marks records will remain protected.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Subject Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.subjectName}
                  onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Subject Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.subjectCode}
                  onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.subjectType}
                  onChange={(e) => setFormData({ ...formData, subjectType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white font-medium"
                >
                  <option value="ACADEMIC">Academic</option>
                  <option value="CO_CURRICULAR">Co-Curricular</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={formSubmitting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {formSubmitting ? 'Updating...' : 'Update Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
