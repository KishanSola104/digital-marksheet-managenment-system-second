import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { AcademicYearProvider } from './context/AcademicYearContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <AuthProvider>
      <AcademicYearProvider>
        <AppRoutes />
      </AcademicYearProvider>
    </AuthProvider>
  );
}
