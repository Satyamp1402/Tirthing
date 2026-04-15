import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LandingLayout from './layouts/LandingLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/user/Dashboard';
import GenerateItinerary from './pages/user/GenerateItinerary';
import ItineraryResult from './pages/user/ItineraryResult';
import MyItineraries from './pages/user/MyItineraries';
import AdminPlaces from './pages/admin/AdminPlaces';
import AddPlace from './pages/admin/AddPlace';
import PlaceDetails from './pages/admin/PlaceDetails';
import EditPlace from './pages/admin/EditPlace';
import BrowsePlaces from './pages/user/BrowsePlaces';
import UserPlaceDetails from './pages/user/UserPlaceDetails';
import AdminDashboard from './pages/admin/AdminDashboard'

function App() {
  return (
    <Router>
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
            <Route path="/generate-itinerary" element={<GenerateItinerary />} />
            <Route path="/itinerary/:id" element={<ItineraryResult />} />
            <Route path="/my-itineraries" element={<MyItineraries />} />
            
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
