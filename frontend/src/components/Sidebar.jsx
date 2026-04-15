import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, MapPin, PlusCircle, LogOut, X } from 'lucide-react';

const Sidebar = ({ onClose }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const navItems = user?.role === 'admin'
    ? [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Manage Places', path: '/admin/places', icon: MapPin },
        { name: 'Add Place', path: '/admin/add-place', icon: PlusCircle }
      ]
    : [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Plan Trip', path: '/generate-itinerary', icon: PlusCircle },
        { name: 'Browse Places', path: '/places', icon: Map },
        { name: 'My Trips', path: '/my-itineraries', icon: Map }
      ];

  return (
    <div className="w-64 bg-surface border-r border-border h-full flex flex-col shadow-sm relative">
      {/* Mobile close button */}
      <button
        onClick={onClose}
        className="md:hidden absolute top-4 right-4 p-2 rounded-full hover:bg-input-bg transition-all"
        aria-label="Close sidebar"
      >
        <X className="w-5 h-5 text-text" />
      </button>

      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link
          to="/dashboard"
          className="text-2xl font-extrabold tracking-tight"
          style={{
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}
        >
          Tirthing
        </Link>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all ${
                isActive
                  ? 'bg-primary-soft text-primary shadow-sm border border-primary/10'
                  : 'text-text-muted hover:bg-input-bg hover:text-text'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        {/* User Info */}
        <div className="flex items-center gap-3 px-0 py-3  border-b border-border">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm shrink-0"
            style={{ background: 'var(--gradient-primary)' }}
          >
            {(user?.name || 'U')[0].toUpperCase()}
          </div>

          <div className="flex flex-col leading-tight overflow-hidden">
            <span className="text-sm font-semibold text-text truncate">
              {user?.name || 'User'}
            </span>
            <span className="text-xs font-medium text-primary uppercase tracking-wide">
              {user?.role || 'Member'}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full mt-3 px-3 py-3 text-red-500 font-medium rounded-xl hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;