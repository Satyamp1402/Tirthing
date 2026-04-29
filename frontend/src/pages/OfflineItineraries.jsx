import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * OfflineItineraries — Fallback page for viewing saved itineraries when offline.
 *
 * When the user is offline and can't reach the API, this page reads
 * previously saved itineraries from localStorage and displays them in
 * a browsable list. Each itinerary was cached by ItineraryResult.jsx
 * when it was first viewed online.
 *
 * localStorage key pattern: 'saved_itinerary_{mongoId}'
 */
const OfflineItineraries = () => {
  const [savedItineraries, setSavedItineraries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Scan localStorage for all keys matching our naming pattern
    const itineraries = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith('saved_itinerary_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data) itineraries.push(data);
        } catch {
          // Skip corrupted entries silently — they'll get overwritten
          // next time the user views that itinerary online
        }
      }
    }

    // Sort by most recently created first (matches the online listing order)
    itineraries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setSavedItineraries(itineraries);
  }, []);

  return (
    <div className="px-6 mx-auto py-3">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-2xl font-extrabold text-text tracking-tight">
          Saved Itineraries (Offline)
        </h2>
        <p className="text-text-muted mt-2">
          These trips were saved to your device for offline access
        </p>
        <div
          className="mt-4 h-1 w-24 rounded-full"
          style={{ background: 'var(--gradient-primary)' }}
        />
      </div>

      {/* Empty State */}
      {savedItineraries.length === 0 ? (
        <div className="text-center bg-surface p-14 rounded-2xl shadow-md border border-border">
          <p className="text-text-muted text-lg">
            No saved itineraries found on this device.
          </p>
          <p className="text-text-muted mt-2 text-sm">
            View an itinerary while online to save it for offline access.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {savedItineraries.map((it) => (
            <div
              key={it._id}
              className="group bg-surface rounded-2xl border border-border shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Subtle hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-primary/5" />

              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-text mb-3 tracking-tight">
                  {it.destination}
                </h3>

                {/* Offline badge */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-orange-50 text-orange-700 rounded-md mb-3 border border-orange-200">
                  📱 Saved offline
                </span>

                <div className="text-sm text-text-muted space-y-2 bg-input-bg p-4 rounded-xl border border-border">
                  <p>
                    <span className="font-semibold text-text">🗓 Days:</span> {it.days}
                  </p>
                  <p>
                    <span className="font-semibold text-text">💰 Budget:</span> ₹{it.budget}
                  </p>
                  <p>
                    <span className="font-semibold text-text">👥 Travelers:</span> {it.groupSize}
                  </p>
                  {it.createdAt && (
                    <p>
                      <span className="font-semibold text-text">📅 Created:</span>{' '}
                      {new Date(it.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => navigate(`/itinerary/${it._id}`)}
                className="relative z-10 mt-4 w-full py-2.5 rounded-xl font-semibold border border-primary text-primary hover:text-white transition-all duration-300"
                style={{ background: 'transparent' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'var(--gradient-primary)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'transparent')
                }
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

export default OfflineItineraries;
