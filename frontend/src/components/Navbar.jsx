import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-surface shadow-sm sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={user ? "/dashboard" : "/"} className="text-2xl font-extrabold tracking-tight" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              Tirthing
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            {!user ? (
              <>
                <Link to="/login" className="font-medium text-text-muted hover:text-primary transition-colors">Login</Link>
                <Link to="/signup" className="text-white px-5 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg" style={{ background: 'var(--gradient-primary)' }}>Sign Up</Link>
              </>
            ) : (
              <Link to="/dashboard" className="text-white px-5 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg" style={{ background: 'var(--gradient-primary)' }}>
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
