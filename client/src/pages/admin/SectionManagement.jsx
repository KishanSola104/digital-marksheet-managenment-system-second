import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import sectionService from '../../services/sectionService';
import classService from '../../services/classService';

export default function SectionManagement() {
  const [sections, setSections] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters & Pagination State
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
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
  const [selectedSection, setSelectedSection] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    classId: '',
    sectionName: '',
    sectionCode: '',
    maximumCapacity: 40
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch Classes for dropdown
  const fetchClassesList = useCallback(async () => {
    try {
      const res = await classService.getClasses();
      if (res.success && res.data) {
        setClassesList(res.data);
      }
    } catch (err) {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchClassesList();
  }, [fetchClassesList]);

  // Fetch Sections
  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page: currentPage,
        limit: recordsPerPage
      };
      if (selectedClassFilter) params.classId = selectedClassFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== '') params.status = statusFilter;

      const res = await sectionService.getSections(params);
      if (res.success && res.data) {
        setSections(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load sections.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, recordsPerPage, selectedClassFilter, searchTerm, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSections();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchSections]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    // Pick the first active class by default
    const activeClasses = classesList.filter((c) => c.isActive);
    const defaultClassId = selectedClassFilter || activeClasses[0]?._id || '';

    setFormData({
      classId: defaultClassId,
      sectionName: '',
      sectionCode: '',
      maximumCapacity: 40
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (section) => {
    setSelectedSection(section);
    setFormData({
      classId: section.classId?._id || section.classId,
      sectionName: section.sectionName || '',
      sectionCode: section.sectionCode || '',
      maximumCapacity: section.maximumCapacity || 40
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
      const res = await sectionService.createSection(formData);
      if (res.success) {
        setIsAddModalOpen(false);
        setSuccessMsg(res.message || 'Section created successfully.');
        fetchSections();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create section.');
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
      const res = await sectionService.updateSection(selectedSection._id, formData);
      if (res.success) {
        setIsEditModalOpen(false);
        setSuccessMsg(res.message || 'Section updated successfully.');
        fetchSections();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update section.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Status Toggle (Activate / Deactivate)
  const handleToggleStatus = async (sec) => {
    const action = sec.isActive ? 'deactivate' : 'activate';
    const confirmText = `Are you sure you want to ${action} Section '${sec.sectionName}'?`;
    if (!window.confirm(confirmText)) return;

    try {
      const res = await sectionService.updateSectionStatus(sec._id, !sec.isActive);
      if (res.success) {
        setSuccessMsg(res.message);
        fetchSections();
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} section.`);
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
        <span className="font-semibold text-navy-900">Section Management</span>
      </nav>

      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Section Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage the sections for each class. You can add, edit, activate or deactivate sections.
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
          Add Section
        </button>
      </div>

      {/* Informational Banner */}
      <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 text-emerald-900">
        <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <div className="text-xs sm:text-sm">
          <p className="font-semibold text-emerald-950">Section & Capacity Configuration</p>
          <p className="text-emerald-800 mt-0.5">
            Sections represent classroom divisions (e.g. A, B, C) created under specific classes.
            Maximum capacity establishes student limits for future student enrollment modules.
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

      {/* Class Filter, Search, and Status Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Class Filter Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Filter by Class
            </label>
            <select
              value={selectedClassFilter}
              onChange={(e) => {
                setSelectedClassFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white font-medium"
            >
              <option value="">All Classes</option>
              {classesList.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.className} ({c.classCode})
                </option>
              ))}
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
                placeholder="Search by Section Name or Code (e.g. A, 1-A)..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Records per page & Status */}
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

      {/* Sections Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-navy-900 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-16">S.No.</th>
                <th className="py-3.5 px-4">Class</th>
                <th className="py-3.5 px-4">Section Name</th>
                <th className="py-3.5 px-4">Section Code</th>
                <th className="py-3.5 px-4">Maximum Capacity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {loading && sections.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-brand-500 border-t-transparent mb-2"></div>
                    <p>Loading sections...</p>
                  </td>
                </tr>
              ) : sections.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-gray-500 font-semibold">No sections found</p>
                    <p className="text-gray-400 text-xs mt-0.5">Click &quot;Add Section&quot; to create sections for your classes.</p>
                  </td>
                </tr>
              ) : (
                sections.map((sec, index) => {
                  const serialNum = (pagination.currentPage - 1) * pagination.limit + index + 1;
                  return (
                    <tr key={sec._id} className="hover:bg-gray-50/80 transition">
                      {/* S.No. */}
                      <td className="py-3 px-4 text-gray-500 font-mono text-xs">{serialNum}</td>

                      {/* Class */}
                      <td className="py-3 px-4 font-semibold text-navy-900">
                        {sec.className}
                        <span className="block text-[10px] text-gray-400 font-mono">{sec.classCode}</span>
                      </td>

                      {/* Section Name */}
                      <td className="py-3 px-4 font-bold text-gray-900">{sec.sectionName}</td>

                      {/* Section Code */}
                      <td className="py-3 px-4 font-mono font-semibold text-gray-700">{sec.sectionCode}</td>

                      {/* Maximum Capacity */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                          {sec.maximumCapacity} students
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {sec.isActive ? (
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
                          onClick={() => handleOpenEditModal(sec)}
                          className="px-2.5 py-1 text-[11px] font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded transition"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(sec)}
                          className={`px-2.5 py-1 text-[11px] font-medium rounded border transition ${
                            sec.isActive
                              ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                          }`}
                        >
                          {sec.isActive ? 'Deactivate' : 'Activate'}
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

      {/* Add Section Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 p-6 relative animate-fadeIn">
            <h2 className="text-lg font-bold text-navy-900 mb-1">Add New Section</h2>
            <p className="text-xs text-gray-500 mb-4">
              Create a section under an active class with student capacity limits.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Parent Class <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white font-medium"
                >
                  <option value="">Select a Class</option>
                  {classesList
                    .filter((c) => c.isActive)
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.className} ({c.classCode})
                      </option>
                    ))}
                </select>
                {classesList.filter((c) => c.isActive).length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    No active classes available. Please create or activate a class first.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Section Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.sectionName}
                  onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                  placeholder="e.g. A, B, Rose, Alpha"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Section Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.sectionCode}
                  onChange={(e) => setFormData({ ...formData, sectionCode: e.target.value })}
                  placeholder="e.g. 1-A, CLS01-A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Maximum Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.maximumCapacity}
                  onChange={(e) => setFormData({ ...formData, maximumCapacity: e.target.value })}
                  placeholder="e.g. 40"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Represents the maximum number of students allowed in this section.
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
                  disabled={formSubmitting || !formData.classId}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : 'Save Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Section Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 p-6 relative animate-fadeIn">
            <h2 className="text-lg font-bold text-navy-900 mb-1">Edit Section</h2>
            <p className="text-xs text-gray-500 mb-4">
              Update section parameters. Parent class cannot be changed to prevent data inconsistencies.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Class (Read Only)
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedSection?.className ? `${selectedSection.className} (${selectedSection.classCode})` : 'Class'}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Section Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.sectionName}
                  onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Section Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.sectionCode}
                  onChange={(e) => setFormData({ ...formData, sectionCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Maximum Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.maximumCapacity}
                  onChange={(e) => setFormData({ ...formData, maximumCapacity: e.target.value })}
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
                  {formSubmitting ? 'Updating...' : 'Update Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
