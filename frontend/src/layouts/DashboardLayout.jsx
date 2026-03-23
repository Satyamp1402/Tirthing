import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <div className="h-screen w-full flex overflow-hidden bg-bg text-text selection:bg-primary-soft selection:text-primary">
      {/* Sidebar - Fixed hidden on mobile, block on larger screens */}
      <div className="hidden md:block h-full">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
