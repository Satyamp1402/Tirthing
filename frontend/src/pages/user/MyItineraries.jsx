// ============================================================================
// MyItineraries — Trip list with useOptimistic for instant delete feedback
// ============================================================================
//
// When a user deletes a trip, we want instant visual feedback — the card
// should vanish immediately, not wait 500ms for the API roundtrip. React 19's
// useOptimistic gives us this: it updates the UI optimistically, and if the
// API call fails, React automatically reverts the list to its previous state.
// ============================================================================

import React, { useEffect, useState, useOptimistic, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { itineraryService } from '../../services/itinerary.service';
import { Trash2 } from 'lucide-react';
import SkeletonCard from '../../components/common/SkeletonCard';

const MyItineraries = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // useOptimistic: removes the trip from UI instantly when delete is clicked.
  // If the API call fails, React reverts the list automatically.
  const [optimisticTrips, removeOptimistic] = useOptimistic(
    itineraries,
    (currentTrips, idToRemove) => currentTrips.filter(t => t._id !== idToRemove)
  );

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const data = await itineraryService.getMyItineraries();
        setItineraries(data);
      } catch (error) {
        console.error('Failed to fetch itineraries', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItineraries();
  }, []);

  const handleView = (itinerary) => {
    navigate(`/itinerary/${itinerary._id}`);
  };

  /**
   * Deletes a trip with optimistic UI — card vanishes instantly,
   * API call runs in the background via useTransition.
   */
  const handleDelete = (id) => {
    startTransition(async () => {
      // Optimistically remove from UI immediately
      removeOptimistic(id);

      try {
        await itineraryService.deleteItinerary(id);
        // On success, update the actual state to match
        setItineraries(prev => prev.filter(t => t._id !== id));
      } catch (err) {
        console.error('Failed to delete itinerary:', err);
        // useOptimistic auto-reverts on error — the card reappears
      }
    });
  };

  // Skeleton loading — shows trip card placeholders instead of a spinner
  if (loading) {
    return (
      <div className="px-6 mx-auto py-3">
        <div className="mb-10">
          <div className="h-7 bg-input-bg rounded w-48 animate-pulse" />
          <div className="h-4 bg-input-bg rounded w-72 mt-3 animate-pulse" />
          <div className="mt-4 h-1 w-24 rounded-full bg-input-bg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} variant="trip" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 mx-auto py-3">
      {/* HEADER */}
      <div className="mb-10">
        <h2 className="text-2xl font-extrabold text-text tracking-tight">
          My Travel Plans
        </h2>
        <p className="text-text-muted mt-2">
          All your saved adventures in one place
        </p>
        <div className="mt-4 h-1 w-24 rounded-full" style={{ background: 'var(--gradient-primary)' }} />
      </div>

      {/* EMPTY STATE */}
      {optimisticTrips.length === 0 ? (
        <div className="text-center bg-surface p-14 rounded-2xl shadow-md border border-border">
          <p className="text-text-muted mb-6 text-lg">
            You haven't generated any itineraries yet.
          </p>
          <button
            onClick={() => navigate('/generate-itinerary')}
            className="text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:scale-105 hover:shadow-lg transition-all"
            style={{ background: 'var(--gradient-primary)' }}
          >
            ✨ Plan a Trip Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {optimisticTrips.map((it) => (
            <div
              key={it._id}
              className="group bg-surface rounded-2xl border border-border shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between relative overflow-hidden"
            >
              {/* subtle hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-primary/5" />

              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-bold text-text mb-3 tracking-tight">
                    {it.destination}
                  </h3>

                  {/* Delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(it._id); }}
                    className="p-2 text-text-muted hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    aria-label={`Delete ${it.destination} trip`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-sm text-text-muted mb-4 space-y-2 bg-input-bg p-4 rounded-xl border border-border">
                  <p><span className="font-semibold text-text">🗓 Days:</span> {it.days}</p>
                  <p><span className="font-semibold text-text">💰 Budget:</span> ₹{it.budget}</p>
                  <p><span className="font-semibold text-text">👥 Travelers:</span> {it.groupSize}</p>
                  <p><span className="font-semibold text-text">📅 Created:</span> {new Date(it.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* BUTTON */}
              <button
                onClick={() => handleView(it)}
                className="relative z-10 mt-4 w-full py-2.5 rounded-xl font-semibold border border-primary text-primary hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ background: 'transparent' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gradient-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                aria-label={`View details for ${it.destination}`}
              >
                View Details →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyItineraries;