// ============================================================================
// GenerateItinerary — Trip planning form with useTransition
// ============================================================================
//
// Uses React 19's useTransition to keep the UI responsive during the
// itinerary generation API call. Unlike manual [loading, setLoading] state,
// useTransition marks the API call as a "transition" — React keeps the form
// interactive and shows the pending state without blocking user input.
// ============================================================================

import React, { useEffect, useState, useTransition } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { itineraryService } from '../../services/itinerary.service';
import { MapPin, CalendarDays, Wallet, Users, Sparkles, ChevronRight } from 'lucide-react';

const travelFacts = [
  'Visiting temples early in the morning helps you avoid long queues and crowds.',
  'Many pilgrimage sites like Kedarnath and Badrinath are only accessible during specific months due to weather conditions.',
  'Carrying cash is useful, as small shops near temples may not accept digital payments.',
  'Festivals like Kumbh Mela attract millions of devotees, so planning in advance is essential.',
  'Some temples have special darshan tickets that can save hours of waiting time.',
  'Traveling during weekdays can make your pilgrimage experience more peaceful.',
];

const GenerateItinerary = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    destination: location.state?.city || '',
    days: 1,
    budget: '',
    groupSize: 1
  });

  const [error, setError] = useState('');
  const [factIndex, setFactIndex] = useState(0);

  // useTransition replaces manual [loading, setLoading] — React manages the
  // pending state and keeps the form responsive during the API call
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % travelFacts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Wrap the API call in startTransition so React treats it as a
    // non-urgent update — the form stays interactive while generating
    startTransition(async () => {
      try {
        const payload = {
          ...formData,
          days: parseInt(formData.days, 10),
          budget: parseFloat(formData.budget),
          groupSize: parseInt(formData.groupSize, 10)
        };

        const data = await itineraryService.generateItinerary(payload);
        navigate(`/itinerary/${data.itinerary._id}`);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Failed to generate itinerary. Try increasing budget or checking destination.'
        );
      }
    });
  };

  const totalFields = 4;
  const progress = Math.round(
    ([
      formData.destination.trim() !== '',
      formData.days > 1,
      formData.budget !== '',
      formData.groupSize > 1
    ].filter(Boolean).length / totalFields) * 100
  );

  return (
    <div className="px-6 md:pb-10 pt-1 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-text tracking-tight">
          Generate Itinerary
        </h1>
        <p className="text-primary text-md">
          Plan your trip based on destination, duration, and budget.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left: Form */}
        <div className="xl:col-span-2">
          <div
            className="bg-surface border border-border rounded-2xl p-6 md:p-8"
            style={{ boxShadow: 'var(--shadow-primary)' }}
          >
            {/* Progress indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-text">Step 1 of 1 • Trip Details</span>
                <span className="text-text-muted">{progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-input-bg overflow-hidden border border-border">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: 'var(--gradient-primary)'
                  }}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-100/50 text-red-600 font-medium p-3 mb-5 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Destination
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-primary w-5 h-5" />
                  <input
                    type="text"
                    name="destination"
                    required
                    value={formData.destination}
                    onChange={handleChange}
                    placeholder="e.g. Varanasi"
                    className="pl-10 w-full px-4 py-3 bg-input-bg border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    aria-label="Destination city"
                  />
                </div>
              </div>

              {/* Grid Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Days */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Days
                  </label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-3 text-primary w-5 h-5" />
                    <input
                      type="number"
                      name="days"
                      min="1"
                      max="14"
                      required
                      value={formData.days}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-3 bg-input-bg border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                      aria-label="Number of days"
                    />
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Budget (₹)
                  </label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-3 text-primary w-5 h-5" />
                    <input
                      type="number"
                      name="budget"
                      min="1000"
                      required
                      value={formData.budget}
                      onChange={handleChange}
                      placeholder="e.g. 5000"
                      className="pl-10 w-full px-4 py-3 bg-input-bg border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                      aria-label="Total budget in rupees"
                    />
                  </div>
                </div>

                {/* Group */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Group Size
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 text-primary w-5 h-5" />
                    <input
                      type="number"
                      name="groupSize"
                      min="1"
                      max="50"
                      required
                      value={formData.groupSize}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-3 bg-input-bg border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                      aria-label="Number of travelers"
                    />
                  </div>
                </div>
              </div>

              {/* Submit — isPending from useTransition replaces manual loading state */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className={`w-full md:w-auto px-8 py-3 rounded-lg text-base font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                    isPending ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  style={{ background: 'var(--gradient-primary)' }}
                  aria-label={isPending ? 'Generating itinerary' : 'Generate itinerary'}
                >
                  {isPending ? (
                    'Generating...'
                  ) : (
                    <>
                      Generate Itinerary
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Static content */}
        <div className="space-y-6 xl:sticky xl:top-6">
          <div className="bg-surface border border-border rounded-2xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-text">Did You Know?</h2>
            </div>

            <div className="min-h-[88px]">
              <p className="text-sm leading-6 text-text-muted">
                {travelFacts[factIndex]}
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              {travelFacts.map((_, index) => (
                <span
                  key={index}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    index === factIndex ? 'bg-primary' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5 md:p-6 shadow-sm">
            <h3 className="text-base font-semibold text-text mb-3">
              Quick note
            </h3>
            <p className="text-sm leading-6 text-text-muted">
              Fill the details and generate a travel plan tailored to your trip size, duration, and budget.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateItinerary;