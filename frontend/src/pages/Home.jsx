import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Map, Calendar, Users, Star, ArrowRight, FileText, MapPin, Route, Navigation } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-surface p-8 rounded-2xl shadow-sm border border-border hover:shadow-lg transition-all duration-300 group">
    <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'var(--color-primary-soft)' }}>
      <Icon className="w-7 h-7" style={{ color: 'var(--color-primary)' }} />
    </div>
    <h3 className="text-xl font-bold text-text mb-3">{title}</h3>
    <p className="text-text-muted leading-relaxed">{description}</p>
  </div>
);

const Home = () => {
  return (
    
    <div className="min-h-screen bg-bg">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden border-b border-border">
        {/* Background Decorative Blur */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full opacity-30 pointer-events-none" style={{ background: 'var(--gradient-bg)', filter: 'blur(100px)' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary-soft mb-8">
            <Star className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">The Ultimate Pilgrimage Planner</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-text mb-8 tracking-tight">
            Discover Your <br className="hidden md:block"/>
            <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              Spiritual Journey
            </span>
          </h1>
          <p className="text-xl text-text-muted mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Generate personalized itineraries, explore sacred places, and manage your spiritual journeys effortlessly. Designed for inner peace.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Start Your Journey <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/admin-signup"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all border shadow-sm hover:bg-input-bg"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                borderColor: 'var(--color-border)'
              }}
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-text mb-4">Everything you need for the perfect pilgrimage</h2>
            <p className="text-lg text-text-muted">We handle the logistics so you can focus on your spiritual connection.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Compass}
              title="Smart Routing"
              description="Our AI engine calculates the optimal path, ensuring you spend less time traveling and more time experiencing."
            />
            <FeatureCard 
              icon={Calendar}
              title="Flexible Timings"
              description="Automatically generate day-by-day plans that respect your preferred pace and the operating hours of sacred sites."
            />
            <FeatureCard 
              icon={Users}
              title="Group Friendly"
              description="Whether you're traveling solo or organizing a large family trip, our platform scales budget and accommodations."
            />
          </div>
        </div>
      </section> */}
      {/* Features Section */}
<section className="py-24 bg-surface">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center max-w-3xl mx-auto mb-16">
      <h2 className="text-3xl md:text-4xl font-extrabold text-text mb-4">
        Everything you need for a perfect pilgrimage
      </h2>
      <p className="text-lg text-text-muted">
        Plan your journey efficiently with smart tools built for seamless travel experiences.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

      <FeatureCard 
        icon={Map}
        title="Itinerary Generation"
        description="Generate complete day-wise travel plans based on your budget, time, and selected preferences."
      />

      <FeatureCard 
        icon={FileText}
        title="Export to PDF"
        description="Download your itinerary as a PDF and access it anytime during your journey."
      />

      <FeatureCard 
        icon={MapPin}
        title="Browse Places"
        description="Explore available destinations with detailed information like entry fee, duration, and priority."
      />

      <FeatureCard 
        icon={Navigation}
        title="View on Map"
        description="Visualize your entire trip on an interactive map with all destinations clearly marked."
      />

      <FeatureCard 
        icon={Route}
        title="Optimized Itinerary Logic"
        description="Plans are generated using smart logic based on budget limits, time constraints, and location proximity."
      />

      <FeatureCard 
        icon={Users}
        title="Flexible for All Travelers"
        description="Plan trips easily whether you're traveling solo, with family, or in a group."
      />

    </div>
  </div>
</section>

      {/* How It Works */}
      <section className="py-24 bg-bg border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-text mb-4">How Tirthing Works</h2>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 text-center relative z-10">
            {[
              { step: "1", title: "Tell Us Where", desc: "Select your destination city and travel duration." },
              { step: "2", title: "Set Constraints", desc: "Define your budget and group size for tailored options." },
              { step: "3", title: "Get Guided", desc: "Receive a comprehensive, mapped-out itinerary instantly." }
            ].map((item, idx) => (
              <div key={idx} className="flex-1 relative">
                <div className="w-16 h-16 mx-auto bg-surface border-2 flex items-center justify-center rounded-full text-2xl font-bold mb-6 shadow-sm z-10 relative" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-text mb-2">{item.title}</h3>
                <p className="text-text-muted">{item.desc}</p>
                {/* Connector Line */}
                {idx !== 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-border -z-10"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-16 bg-surface border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <h2 className="text-2xl font-bold text-text mb-6">Ready to find inner peace?</h2>
          <Link
            to="/login"
            className="px-8 py-3 rounded-lg text-white font-semibold transition-all shadow-md hover:shadow-lg inline-block"
            style={{ background: 'var(--gradient-primary)' }}
          >
            Create Your Account
          </Link>
          <p className="mt-12 text-sm text-text-muted font-medium">© {new Date().getFullYear()} Tirthing. Crafted with devotion.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
