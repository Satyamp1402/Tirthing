import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import OfflineBanner from './components/OfflineBanner';
import useNetworkStatus from './hooks/useNetworkStatus';
import LandingLayout from './layouts/LandingLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/user/Dashboard';
import GenerateItinerary from './pages/user/GenerateItinerary';
import ItineraryResult from './pages/user/ItineraryResult';
import MyItineraries from './pages/user/MyItineraries';
import OfflineItineraries from './pages/OfflineItineraries';
import AdminPlaces from './pages/admin/AdminPlaces';
import AddPlace from './pages/admin/AddPlace';
import PlaceDetails from './pages/admin/PlaceDetails';
import EditPlace from './pages/admin/EditPlace';
import BrowsePlaces from './pages/user/BrowsePlaces';
import UserPlaceDetails from './pages/user/UserPlaceDetails';
import BudgetTracker from './pages/user/BudgetTracker';
import AdminDashboard from './pages/admin/AdminDashboard'

/**
 * Friendly message shown when the user is offline and tries to use the
 * itinerary generator, which requires an API call to work.
 */
const OfflineGenerateMessage = () => (
  <div className="max-w-xl mx-auto text-center mt-20 px-6">
    <div className="bg-surface p-10 rounded-2xl shadow-md border border-border">
      <div className="text-5xl mb-4">🔌</div>
      <h2 className="text-2xl font-extrabold text-text mb-3">
        You're currently offline
      </h2>
      <p className="text-text-muted mb-6 leading-relaxed">
        Generating a new itinerary requires an internet connection to fetch
        places and run the planning engine. Please reconnect and try again.
      </p>
      <p className="text-sm text-text-muted">
        In the meantime, your{' '}
        <a href="/my-itineraries" className="text-primary font-semibold hover:underline">
          saved itineraries
        </a>{' '}
        are still available offline.
      </p>
    </div>
  </div>
);

function App() {
  const { isOnline } = useNetworkStatus();

  return (
    <Router>
      {/* Global offline banner — slides down from top when connectivity drops */}
      <OfflineBanner />

      <Routes>
        {/* Public Routes with Landing Layout */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<Login isAdmin={true} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin-signup" element={<Signup isAdmin={true} />} />
        </Route>
        
        {/* Private Routes with Dashboard Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* User Dashboard Routes */}
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/places" element={<BrowsePlaces />} />
            <Route path="/places/:id" element={<UserPlaceDetails />} />

            {/* When offline, show a friendly message instead of the generate form
                since generating requires an API call to the backend */}
            <Route
              path="/generate-itinerary"
              element={isOnline ? <GenerateItinerary /> : <OfflineGenerateMessage />}
            />

            <Route path="/itinerary/:id" element={<ItineraryResult />} />

            {/* When offline, show locally saved itineraries instead of
                fetching from the API (which would fail) */}
            <Route
              path="/my-itineraries"
              element={isOnline ? <MyItineraries /> : <OfflineItineraries />}
            />

            {/* Budget tracker — localStorage-based expense tracking per trip */}
            <Route path="/trip/:itineraryId/tracker" element={<BudgetTracker />} />
            
            {/* Admin Dashboard Routes */}
            <Route element={<ProtectedRoute roleRequired="admin" />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/places" element={<AdminPlaces />} />
              <Route path="/admin/add-place" element={<AddPlace />} />
              <Route path="/admin/places/:id" element={<PlaceDetails />} />
              <Route path="/admin/places/edit/:id" element={<EditPlace />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
