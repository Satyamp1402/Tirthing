import React from 'react';

const Header = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <header className="h-16 bg-surface border-b border-border shadow-sm flex items-center justify-between px-8 z-10">
      <h2 className="text-xl font-bold text-text hidden sm:block">Dashboard Overview</h2>
      <div className="flex items-center gap-4 ml-auto">
        <div className="flex flex-col items-end">
          <span className="text-sm font-bold text-text">{user.name || 'User'}</span>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">{user.role || 'Member'}</span>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm" style={{ background: 'var(--gradient-primary)' }}>
          {(user.name || 'U')[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Header;
