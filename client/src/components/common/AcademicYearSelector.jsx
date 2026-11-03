import React, { useState, useRef, useEffect } from 'react';
import { useAcademicYear } from '../../context/AcademicYearContext';

export default function AcademicYearSelector() {
  const { academicYears, selectedYear, setSelectedYear, isLoading } = useAcademicYear();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-800 border border-navy-700 hover:bg-navy-750 text-white text-xs sm:text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-500"
        title="Select Academic Year"
      >
        <svg className="w-4 h-4 text-brand-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="truncate max-w-[120px] sm:max-w-[160px]">
          {isLoading ? (
            <span className="text-gray-400">Loading...</span>
          ) : selectedYear ? (
            <span className="text-white font-semibold">{selectedYear.academicYearName || selectedYear.yearName}</span>
          ) : (
            <span className="text-gray-300">No Year Selected</span>
          )}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 sm:w-64 rounded-xl bg-white shadow-xl border border-gray-200 py-1.5 z-50 text-gray-800 text-xs sm:text-sm focus:outline-none animate-fadeIn">
          <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
            <span className="font-semibold text-navy-900 text-xs uppercase tracking-wider">Academic Year</span>
            <span className="text-[11px] text-gray-400">{academicYears.length} found</span>
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {academicYears.length === 0 ? (
              <div className="px-4 py-3 text-center text-xs text-gray-500">
                No academic years available.
              </div>
            ) : (
              academicYears.map((year) => {
                const isSelected = selectedYear?._id === year._id;
                return (
                  <button
                    key={year._id}
                    type="button"
                    onClick={() => {
                      setSelectedYear(year);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      {isSelected ? (
                        <svg className="w-4 h-4 text-brand-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <div className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span className="truncate">{year.academicYearName || year.yearName}</span>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {year.isCurrent && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Current
                        </span>
                      )}
                      {year.status && (
                        <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded">
                          {year.status}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
