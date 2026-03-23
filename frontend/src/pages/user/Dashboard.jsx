import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="bg-surface rounded-xl shadow-lg border border-border p-8 text-center max-w-3xl mx-auto" style={{ boxShadow: 'var(--shadow-primary)' }}>
      <h1 className="text-4xl font-extrabold text-text mb-4 tracking-tight">Welcome back, {user.name}!</h1>
      <p className="text-lg text-text-muted mb-8 font-medium">
        Ready for your next spiritual journey? Let our advanced itinerary generator plan the perfect trip for you based on your budget, group size, and preferred destination.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/generate-itinerary" className="block p-8 bg-input-bg border border-border rounded-xl hover:shadow-md transition-all group">
          <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-primary-hover transition-colors">Plan a New Trip</h3>
          <p className="text-text-muted text-sm font-medium">Enter your constraints and let our algorithm build the optimal route.</p>
        </Link>
        <Link to="/my-itineraries" className="block p-8 bg-input-bg border border-border rounded-xl hover:shadow-md transition-all group">
          <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-primary-hover transition-colors">My Itineraries</h3>
          <p className="text-text-muted text-sm font-medium">View and manage your previously generated travel plans.</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
