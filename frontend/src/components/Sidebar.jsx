import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, MapPin, PlusCircle, LogOut } from 'lucide-react';

const Sidebar = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const navItems = user?.role === 'admin' 
    ? [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Manage Places', path: '/admin/places', icon: MapPin },
        { name: 'Add Place', path: '/admin/add-place', icon: PlusCircle }
      ]
    : [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Plan Trip', path: '/generate-itinerary', icon: PlusCircle },
        { name: 'My Trips', path: '/my-itineraries', icon: Map }
      ];

  return (
    <div className="w-64 bg-surface border-r border-border h-full flex flex-col shadow-sm">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link to="/dashboard" className="text-2xl font-extrabold tracking-tight" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
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
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-500 font-medium rounded-xl hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
