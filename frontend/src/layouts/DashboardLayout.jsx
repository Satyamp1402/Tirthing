// import React from 'react';
// import Sidebar from '../components/Sidebar';
// import Header from '../components/Header';
// import { Outlet } from 'react-router-dom';

// const DashboardLayout = () => {
//   return (
//     <div className="h-screen w-full flex overflow-hidden bg-bg text-text selection:bg-primary-soft selection:text-primary">
//       {/* Sidebar - Fixed hidden on mobile, block on larger screens */}
//       <div className="hidden md:block h-full">
//         <Sidebar />
//       </div>

//       <div className="flex-1 flex flex-col h-full overflow-hidden relative">
//         <Header />
        
//         {/* Main Content Area */}
//         <main className="flex-1 overflow-y-auto p-4 sm:p-8">
//           <div className="max-w-7xl mx-auto w-full">
//             <Outlet />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default DashboardLayout;



// import React, { useState } from 'react';
// import Sidebar from '../components/Sidebar';
// import Header from '../components/Header';
// import { Outlet } from 'react-router-dom';
// import { Menu } from 'lucide-react';

// const DashboardLayout = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   return (
//     <div className="h-screen w-full flex overflow-hidden bg-bg text-text selection:bg-primary-soft selection:text-primary">
      
//       {/* Desktop Sidebar */}
//       <div className="hidden md:block h-full">
//         <Sidebar />
//       </div>

//       {/* Mobile Sidebar Overlay */}
//       {isSidebarOpen && (
//         <div className="fixed inset-0 z-40 flex">
//           {/* Overlay */}
//           <div
//             className="fixed inset-0 bg-black/40"
//             onClick={() => setIsSidebarOpen(false)}
//           />

//           {/* Sidebar */}
//           <div className="relative z-50 h-full">
//             <Sidebar />
//           </div>
//         </div>
//       )}

//       <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
//         {/* Mobile Top Bar */}
//         <div className="md:hidden flex items-center justify-between px-4 h-16 border-b border-border bg-surface">
//           <button onClick={() => setIsSidebarOpen(true)}>
//             <Menu className="w-6 h-6" />
//           </button>

//           <span className="text-2xl font-extrabold tracking-tight" style={{
//             background: 'var(--gradient-primary)',
//             WebkitBackgroundClip: 'text',
//             color: 'transparent'
//           }}>Tirthing</span>


//           <div />
//         </div>

//         <Header />

//         {/* Main Content Area */}
//         <main className="flex-1 overflow-y-auto p-4 sm:p-8">
//           <div className="max-w-7xl mx-auto w-full">
//             <Outlet />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default DashboardLayout;



import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-bg text-text selection:bg-primary-soft selection:text-primary">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Sidebar */}
          <div className="relative z-50 h-full">
            <Sidebar onClose={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between px-4 h-16 border-b border-border bg-surface">
          {/* LEFT: Hamburger */}
          <button onClick={() => setIsSidebarOpen(true)} aria-label="Open sidebar">
            <Menu className="w-6 h-6" />
          </button>

          {/* RIGHT: Date + Message */}
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-text">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
              })}
            </span>
            <span className="text-xs font-semibold text-primary">
              Have a great day ✨
            </span>
          </div>
        </div>

        {/* Hide Header on small screens */}
        <div className="hidden md:block">
          <Header />
        </div>

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