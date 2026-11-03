import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import academicYearService from '../services/academicYearService';
import { useAuth } from './AuthContext';

const AcademicYearContext = createContext(null);

export function AcademicYearProvider({ children }) {
  const { school, user } = useAuth();
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYearState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentSchoolId = user?.schoolId || school?.schoolId;

  const fetchYears = useCallback(async () => {
    if (!currentSchoolId || !user) {
      setAcademicYears([]);
      setSelectedYearState(null);
      return;
    }

    try {
      setIsLoading(true);
      const res = await academicYearService.getAcademicYears();
      if (res.success && Array.isArray(res.data)) {
        const years = res.data;
        setAcademicYears(years);

        if (years.length === 0) {
          setSelectedYearState(null);
          return;
        }

        // Check if there is a previously chosen year for this school in localStorage
        const storageKey = `dmms_selected_academic_year_${currentSchoolId.toUpperCase()}`;
        const savedYearId = localStorage.getItem(storageKey);

        const matchedSaved = savedYearId ? years.find((y) => y._id === savedYearId) : null;
        if (matchedSaved) {
          setSelectedYearState(matchedSaved);
        } else {
          // If a year is marked isCurrent, select it
          const currentYear = years.find((y) => y.isCurrent);
          if (currentYear) {
            setSelectedYearState(currentYear);
            localStorage.setItem(storageKey, currentYear._id);
          } else {
            // Default selection rule: pick first/most recent year without altering database
            setSelectedYearState(years[0]);
            localStorage.setItem(storageKey, years[0]._id);
          }
        }
      } else {
        setAcademicYears([]);
        setSelectedYearState(null);
      }
    } catch (err) {
      setAcademicYears([]);
      setSelectedYearState(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentSchoolId, user]);

  useEffect(() => {
    fetchYears();
  }, [fetchYears]);

  const selectYear = (year) => {
    if (!year) {
      setSelectedYearState(null);
      return;
    }
    // Validate year belongs to this school
    const exists = academicYears.find((y) => y._id === year._id && y.schoolId.toUpperCase() === currentSchoolId?.toUpperCase());
    if (exists) {
      setSelectedYearState(exists);
      if (currentSchoolId) {
        localStorage.setItem(`dmms_selected_academic_year_${currentSchoolId.toUpperCase()}`, exists._id);
      }
    }
  };

  const clearSelectedYear = () => {
    setSelectedYearState(null);
    if (currentSchoolId) {
      localStorage.removeItem(`dmms_selected_academic_year_${currentSchoolId.toUpperCase()}`);
    }
  };

  return (
    <AcademicYearContext.Provider
      value={{
        academicYears,
        selectedYear,
        isLoading,
        setSelectedYear: selectYear,
        clearSelectedYear,
        refreshAcademicYears: fetchYears
      }}
    >
      {children}
    </AcademicYearContext.Provider>
  );
}

export function useAcademicYear() {
  const context = useContext(AcademicYearContext);
  if (!context) {
    throw new Error('useAcademicYear must be used within an AcademicYearProvider');
  }
  return context;
}
