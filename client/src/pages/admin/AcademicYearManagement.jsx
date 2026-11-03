import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import academicYearService from '../../services/academicYearService';
import { useAcademicYear } from '../../context/AcademicYearContext';

export default function AcademicYearManagement() {
  const { refreshAcademicYears } = useAcademicYear();

  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
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
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    academicYearName: '',
    startDate: '',
    endDate: '',
    isCurrent: false
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Format date helper (e.g. 01 Apr 2025)
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Convert Date to YYYY-MM-DD for date inputs
  const toInputDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  // Fetch Academic Years
  const fetchAcademicYears = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page: currentPage,
        limit: recordsPerPage
      };
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const res = await academicYearService.getAcademicYears(params);
      if (res.success && res.data) {
        setAcademicYears(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load academic years.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, recordsPerPage, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAcademicYears();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchAcademicYears]);

  // Auto-generate academic year label when dates change in Add modal
  const handleDateChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    if (updated.startDate && updated.endDate) {
      const sYear = new Date(updated.startDate).getFullYear();
      const eYear = new Date(updated.endDate).getFullYear();
      if (!isNaN(sYear) && !isNaN(eYear)) {
        updated.academicYearName = `${sYear} - ${eYear}`;
      }
    }
    setFormData(updated);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormData({
      academicYearName: '',
      startDate: '',
      endDate: '',
      isCurrent: false
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (year) => {
    setSelectedYear(year);
    setFormData({
      academicYearName: year.academicYearName || year.yearName || '',
      startDate: toInputDate(year.startDate),
      endDate: toInputDate(year.endDate),
      isCurrent: !!year.isCurrent
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  // Open View Modal
  const handleOpenViewModal = (year) => {
    setSelectedYear(year);
    setIsViewModalOpen(true);
  };

  // Handle Add Submission
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    try {
      const res = await academicYearService.createAcademicYear(formData);
      if (res.success) {
        setIsAddModalOpen(false);
        setSuccessMsg(res.message || 'Academic year created successfully.');
        await refreshAcademicYears();
        fetchAcademicYears();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create academic year.');
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
      const res = await academicYearService.updateAcademicYear(selectedYear._id, formData);
      if (res.success) {
        setIsEditModalOpen(false);
        setSuccessMsg(res.message || 'Academic year updated successfully.');
        await refreshAcademicYears();
        fetchAcademicYears();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update academic year.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Set As Current
  const handleSetCurrent = async (year) => {
    if (year.isCurrent) return;
    const confirmText = `Are you sure you want to set '${year.academicYearName || year.yearName}' as the Current Academic Year?`;
    if (!window.confirm(confirmText)) return;

    try {
      const res = await academicYearService.setCurrentAcademicYear(year._id);
      if (res.success) {
        setSuccessMsg(res.message || 'Academic year set as current.');
        await refreshAcademicYears();
        fetchAcademicYears();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set as current academic year.');
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Closed':
      case 'Completed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <MainLayout>
      {/* Breadcrumb Navigation */}
      <nav className="mb-4 flex items-center space-x-2 text-xs text-gray-500">
        <Link to="/admin/dashboard" className="hover:text-brand-600 transition">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-gray-400">Administrative Setup</span>
        <span>/</span>
        <span className="font-semibold text-navy-900">Academic Year Management</span>
      </nav>

      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Academic Year Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage the school&apos;s academic years. Only one academic year can be marked as Current at a time.
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
          Add Academic Year
        </button>
      </div>

      {/* Informational Banner */}
      <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 text-emerald-900">
        <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-xs sm:text-sm">
          <p className="font-semibold text-emerald-950">Academic Year Operations</p>
          <p className="text-emerald-800 mt-0.5">
            Academic sessions define the institutional calendar for student enrollments, exam records, and marksheets.
            Historical records are permanently preserved. Only one session can be designated as Current.
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

      {/* Search and Records Per Page Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Academic Year (e.g. 2026)..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Records per page selector */}
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 self-end sm:self-auto">
            <span>Show</span>
            <select
              value={recordsPerPage}
              onChange={(e) => {
                setRecordsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-xs sm:text-sm"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>entries</span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-navy-900 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-16">S.No.</th>
                <th className="py-3.5 px-4">Academic Year</th>
                <th className="py-3.5 px-4">Start Date</th>
                <th className="py-3.5 px-4">End Date</th>
                <th className="py-3.5 px-4">Current</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {loading && academicYears.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-brand-500 border-t-transparent mb-2"></div>
                    <p>Loading academic years...</p>
                  </td>
                </tr>
              ) : academicYears.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 font-semibold">No academic years found</p>
                    <p className="text-gray-400 text-xs mt-0.5">Click &quot;Add Academic Year&quot; to configure your first session.</p>
                  </td>
                </tr>
              ) : (
                academicYears.map((year, index) => {
                  const serialNum = (pagination.currentPage - 1) * pagination.limit + index + 1;
                  const yearName = year.academicYearName || year.yearName;
                  return (
                    <tr key={year._id} className="hover:bg-gray-50/80 transition">
                      {/* S.No. */}
                      <td className="py-3 px-4 text-gray-500 font-mono text-xs">{serialNum}</td>

                      {/* Academic Year */}
                      <td className="py-3 px-4 font-bold text-navy-900 flex items-center space-x-2">
                        <span>{yearName}</span>
                        {year.isCurrent && (
                          <span className="inline-block w-2 h-2 rounded-full bg-amber-500" title="Active Current Session"></span>
                        )}
                      </td>

                      {/* Start Date */}
                      <td className="py-3 px-4 text-gray-600 font-mono text-xs">{formatDate(year.startDate)}</td>

                      {/* End Date */}
                      <td className="py-3 px-4 text-gray-600 font-mono text-xs">{formatDate(year.endDate)}</td>

                      {/* Current */}
                      <td className="py-3 px-4">
                        {year.isCurrent ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600">
                            No
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border ${getStatusBadge(year.status)}`}>
                          {year.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {!year.isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleSetCurrent(year)}
                            className="px-2.5 py-1 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition"
                            title="Set as Current Academic Year"
                          >
                            Set Current
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenViewModal(year)}
                          className="px-2.5 py-1 text-[11px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(year)}
                          className="px-2.5 py-1 text-[11px] font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded transition"
                        >
                          Edit
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

      {/* Add Academic Year Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 p-6 relative animate-fadeIn">
            <h2 className="text-lg font-bold text-navy-900 mb-1">Add Academic Year</h2>
            <p className="text-xs text-gray-500 mb-4">
              Enter the start and end dates. The academic year label will be calculated automatically.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Academic Year Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.academicYearName}
                  onChange={(e) => setFormData({ ...formData, academicYearName: e.target.value })}
                  placeholder="e.g. 2026 - 2027"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium"
                />
                <p className="text-[11px] text-gray-400 mt-0.5">Format: YYYY - YYYY</p>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="addIsCurrent"
                  checked={formData.isCurrent}
                  onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                />
                <label htmlFor="addIsCurrent" className="text-xs font-medium text-gray-700">
                  Mark as Current Academic Year immediately
                </label>
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
                  {formSubmitting ? 'Saving...' : 'Save Academic Year'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Academic Year Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 p-6 relative animate-fadeIn">
            <h2 className="text-lg font-bold text-navy-900 mb-1">Edit Academic Year</h2>
            <p className="text-xs text-gray-500 mb-4">
              Update session dates and title. Historical dependent records must remain protected.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Academic Year Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.academicYearName}
                  onChange={(e) => setFormData({ ...formData, academicYearName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium"
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
                  {formSubmitting ? 'Updating...' : 'Update Academic Year'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewModalOpen && selectedYear && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 p-6 relative animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-navy-900">Academic Year Details</h2>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Session Name</span>
                <span className="font-bold text-navy-900">{selectedYear.academicYearName || selectedYear.yearName}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Start Date</span>
                <span className="font-mono text-gray-800">{formatDate(selectedYear.startDate)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-medium">End Date</span>
                <span className="font-mono text-gray-800">{formatDate(selectedYear.endDate)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Current Academic Year</span>
                <span className="font-semibold text-gray-800">
                  {selectedYear.isCurrent ? 'Yes (Designated)' : 'No'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Status</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getStatusBadge(selectedYear.status)}`}>
                  {selectedYear.status}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Created On</span>
                <span className="text-gray-600">{formatDate(selectedYear.createdAt)}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs sm:text-sm font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
