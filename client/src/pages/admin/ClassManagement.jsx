import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import classService from '../../services/classService';

export default function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Pagination State
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
  const [selectedClass, setSelectedClass] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    className: '',
    classCode: '',
    plannedSectionCount: 0
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch Classes
  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page: currentPage,
        limit: recordsPerPage
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== '') params.status = statusFilter;

      const res = await classService.getClasses(params);
      if (res.success && res.data) {
        setClasses(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load classes.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, recordsPerPage, searchTerm, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClasses();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchClasses]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormData({
      className: '',
      classCode: '',
      plannedSectionCount: 0
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (cls) => {
    setSelectedClass(cls);
    setFormData({
      className: cls.className || '',
      classCode: cls.classCode || '',
      plannedSectionCount: cls.plannedSectionCount !== undefined ? cls.plannedSectionCount : 0
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
      const res = await classService.createClass(formData);
      if (res.success) {
        setIsAddModalOpen(false);
        setSuccessMsg(res.message || 'Class created successfully.');
        fetchClasses();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create class.');
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
      const res = await classService.updateClass(selectedClass._id, formData);
      if (res.success) {
        setIsEditModalOpen(false);
        setSuccessMsg(res.message || 'Class updated successfully.');
        fetchClasses();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update class.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Status Toggle (Activate / Deactivate)
  const handleToggleStatus = async (cls) => {
    const action = cls.isActive ? 'deactivate' : 'activate';
    const confirmText = `Are you sure you want to ${action} '${cls.className}'?`;
    if (!window.confirm(confirmText)) return;

    try {
      const res = await classService.updateClassStatus(cls._id, !cls.isActive);
      if (res.success) {
        setSuccessMsg(res.message);
        fetchClasses();
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} class.`);
    }
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
        <span className="font-semibold text-navy-900">Class Management</span>
      </nav>

      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Class Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage the school&apos;s classes. You can add, edit, activate or deactivate classes.
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
          Add Class
        </button>
      </div>

      {/* Informational Banner */}
      <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 text-emerald-900">
        <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <div className="text-xs sm:text-sm">
          <p className="font-semibold text-emerald-950">Master Class Structure</p>
          <p className="text-emerald-800 mt-0.5">
            Classes are school-level master entities that persist across all academic years. Sections and curriculum allocations are established under each class.
          </p>
        </div>
      </div>

      {/* Success and Error Alerts */}
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

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Class Name or Class Code (e.g. 5, CLS05)..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>

            {/* Records per page */}
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

      {/* Classes Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-navy-900 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-16">S.No.</th>
                <th className="py-3.5 px-4">Class Name</th>
                <th className="py-3.5 px-4">Class Code</th>
                <th className="py-3.5 px-4">Number of Sections</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {loading && classes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-brand-500 border-t-transparent mb-2"></div>
                    <p>Loading classes...</p>
                  </td>
                </tr>
              ) : classes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-gray-500 font-semibold">No classes found</p>
                    <p className="text-gray-400 text-xs mt-0.5">Click &quot;Add Class&quot; to configure institutional classes.</p>
                  </td>
                </tr>
              ) : (
                classes.map((cls, index) => {
                  const serialNum = (pagination.currentPage - 1) * pagination.limit + index + 1;
                  return (
                    <tr key={cls._id} className="hover:bg-gray-50/80 transition">
                      {/* S.No. */}
                      <td className="py-3 px-4 text-gray-500 font-mono text-xs">{serialNum}</td>

                      {/* Class Name */}
                      <td className="py-3 px-4 font-bold text-navy-900">{cls.className}</td>

                      {/* Class Code */}
                      <td className="py-3 px-4 font-mono font-semibold text-gray-700">{cls.classCode}</td>

                      {/* Number of Sections */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {cls.sectionCount || 0} {cls.sectionCount === 1 ? 'Section' : 'Sections'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {cls.isActive ? (
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
                          onClick={() => handleOpenEditModal(cls)}
                          className="px-2.5 py-1 text-[11px] font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded transition"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cls)}
                          className={`px-2.5 py-1 text-[11px] font-medium rounded border transition ${
                            cls.isActive
                              ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                          }`}
                        >
                          {cls.isActive ? 'Deactivate' : 'Activate'}
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

      {/* Add Class Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 p-6 relative animate-fadeIn">
            <h2 className="text-lg font-bold text-navy-900 mb-1">Add New Class</h2>
            <p className="text-xs text-gray-500 mb-4">
              Enter class specifications. Classes serve as the master academic structure.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Class Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  placeholder="e.g. 5, Class 1, Grade 10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Class Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.classCode}
                  onChange={(e) => setFormData({ ...formData, classCode: e.target.value })}
                  placeholder="e.g. CLS05, CLS01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Planned Number of Sections (Reference Only)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.plannedSectionCount}
                  onChange={(e) => setFormData({ ...formData, plannedSectionCount: e.target.value })}
                  placeholder="e.g. 3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <p className="text-[11px] text-gray-400 mt-0.5">
                  This field is for planning only. Sections are created separately in Section Management.
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
                  {formSubmitting ? 'Saving...' : 'Save Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 p-6 relative animate-fadeIn">
            <h2 className="text-lg font-bold text-navy-900 mb-1">Edit Class</h2>
            <p className="text-xs text-gray-500 mb-4">
              Update class details. Unique identifiers and historical records are preserved.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Class Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Class Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.classCode}
                  onChange={(e) => setFormData({ ...formData, classCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Planned Number of Sections (Reference Only)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.plannedSectionCount}
                  onChange={(e) => setFormData({ ...formData, plannedSectionCount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
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
                  {formSubmitting ? 'Updating...' : 'Update Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
