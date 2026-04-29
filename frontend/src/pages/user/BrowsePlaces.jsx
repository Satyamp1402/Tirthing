// ============================================================================
// BrowsePlaces — Searchable grid of pilgrimage sites with useDeferredValue
// ============================================================================
//
// Uses React 19's useDeferredValue for the search filter. This keeps the
// input responsive while the (potentially large) list re-renders with
// filtered results. Without it, typing in the search box would stutter
// when filtering 266+ Varanasi sites because every keystroke triggers a
// full list re-render synchronously.
// ============================================================================

import React, { useEffect, useState, useDeferredValue } from "react";
import { placeService } from "../../services/place.service";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import SkeletonCard from "../../components/common/SkeletonCard";

const BrowsePlaces = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  // useDeferredValue lets React defer the expensive filter re-render
  // while keeping the search input snappy — the input updates immediately,
  // and the filtered list catches up a frame or two later
  const deferredSearch = useDeferredValue(searchInput);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const data = await placeService.getAllPlaces();
        setPlaces(data);
      } catch (err) {
        console.error("Failed to load places:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  // Filter using the deferred value, not the raw input
  const filteredPlaces = places.filter((place) => {
    const query = deferredSearch.toLowerCase();
    return (
      place.name.toLowerCase().includes(query) ||
      place.city.toLowerCase().includes(query)
    );
  });

  // Visual hint: dim the list slightly when the deferred value is stale
  const isStale = searchInput !== deferredSearch;

  return (
    <div className="min-h-screen bg-bg px-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-text tracking-tight">
          Browse Places
        </h1>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or city..."
            className="pl-9 w-full px-4 py-2 bg-input-bg border border-border text-text rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            aria-label="Search places"
          />
        </div>
      </div>

      {/* Loading skeletons — set layout expectations instead of a blank spinner */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} variant="card" />
          ))}
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg font-medium">No places found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      ) : (
        /* Grid — opacity dims slightly while deferred value catches up */
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-150"
          style={{ opacity: isStale ? 0.7 : 1 }}
        >
          {filteredPlaces.map((place) => (
            <div
              key={place._id}
              onClick={() => navigate(`/places/${place._id}`)}
              className="cursor-pointer bg-surface border border-border rounded-xl shadow-sm hover:shadow-xl transition-all overflow-hidden focus-within:ring-2 focus-within:ring-primary"
              tabIndex={0}
              role="button"
              aria-label={`View ${place.name} in ${place.city}`}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/places/${place._id}`)}
            >
              {/* Image */}
              <div className="overflow-hidden">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-44 object-cover hover:scale-105 transition-all duration-500"
                  loading="lazy"
                />
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-text">{place.name}</h3>
                <p className="text-sm text-text-muted">{place.city}</p>

                <span className="inline-block mt-3 px-3 py-1 text-xs rounded-full bg-primary-soft text-text">
                  {place.priority === 1
                    ? "Must Visit"
                    : place.priority === 2
                    ? "Recommended"
                    : "Optional"}
                </span>

                <div className="mt-3 flex justify-between text-sm text-text-muted">
                  <span>⏱ {place.visitDuration}h</span>
                  <span>₹{place.entryFee}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowsePlaces;