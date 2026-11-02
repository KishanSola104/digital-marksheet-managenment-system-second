import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-navy-900 border-t border-navy-800 text-gray-400 text-xs py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-semibold text-gray-200">Digital Marksheet Management System (DMMS)</span>
          <p className="text-gray-400 mt-1">Multi-school marksheet generation, verification, and academic records platform.</p>
        </div>
        <div className="text-right">
          <p>&copy; {new Date().getFullYear()} DMMS. All rights reserved.</p>
          <p className="text-gray-400 text-[11px] mt-0.5">Secure • Verifiable • Three-Tier Architecture</p>
        </div>
      </div>
    </footer>
  );
}
