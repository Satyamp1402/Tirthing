import React from 'react';

const Header = () => {
  const today = new Date();

  const formattedDate = today.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  return (
    <header className="h-16 bg-surface border-b border-border shadow-sm flex items-center justify-between px-4 sm:px-8 z-10">
      {/* LEFT: Tagline */}
      <div className="flex flex-col text-2xl font-bold text-text-muted tracking-tight">
        {/* keep this empty so that right side stays in right side */}
      </div>

      {/* RIGHT: Date + Message */}
      <div className="flex flex-col items-end">
        <span className="text-sm font-bold text-text">
          {formattedDate}
        </span>
        <span className="text-xs font-semibold text-primary">
          Have a great day ✨
        </span>
      </div>
    </header>
  );
};

export default Header;