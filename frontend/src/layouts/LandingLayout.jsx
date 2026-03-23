import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Outlet } from 'react-router-dom';

const LandingLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-text selection:bg-primary-soft selection:text-primary">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default LandingLayout;
