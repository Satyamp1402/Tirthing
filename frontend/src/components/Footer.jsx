import React from 'react';

const Footer = () => {
  return (
    <footer className="py-12 bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <h2 className="text-xl font-bold text-text mb-2">Tirthing</h2>
        <p className="text-sm text-text-muted font-medium mb-6">Designed for pure spiritual journeys.</p>
        <p className="text-sm text-text-light font-medium">© {new Date().getFullYear()} Tirthing. Crafted with devotion.</p>
      </div>
    </footer>
  );
};

export default Footer;
