import React, { useEffect, useState } from "react";
import { placeService } from "../../services/place.service";
import { useNavigate } from "react-router-dom";

const BrowsePlaces = () => {
  const [places, setPlaces] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaces = async () => {
      const data = await placeService.getAllPlaces();
      setPlaces(data);
    };
    fetchPlaces();
  }, []);

  return (
    <div className="min-h-screen bg-bg px-6 pb-10">

      {/* Header */}
      <h1 className="text-3xl font-bold text-text mb-8 tracking-tight">
        Browse Places
      </h1>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {places.map((place) => (
          <div
            key={place._id}
            onClick={() => navigate(`/places/${place._id}`)}
            className="cursor-pointer bg-surface border border-border rounded-xl 
            shadow-(--shadow-primary) hover:shadow-xl transition-all overflow-hidden"
          >

            {/* Image */}
            <div className="overflow-hidden">
              <img
                src={place.image}
                alt={place.name}
                className="w-full h-44 object-cover hover:scale-105 transition-all duration-500"
              />
            </div>

            {/* Content */}
            <div className="p-4">

              <h3 className="text-lg font-bold text-text">
                {place.name}
              </h3>

              <p className="text-sm text-text-muted">
                {place.city}
              </p>

              {/* Priority Badge (FIXED COLORS → saffron theme) */}
              <span
                className="inline-block mt-3 px-3 py-1 text-xs rounded-full 
                bg-primary-soft text-text"
              >
                {place.priority === 1
                  ? "Must Visit"
                  : place.priority === 2
                  ? "Recommended"
                  : "Optional"}
              </span>

              {/* Extra Info */}
              <div className="mt-3 flex justify-between text-sm text-text-muted">
                <span>⏱ {place.visitDuration}h</span>
                <span>₹{place.entryFee}</span>
              </div>

            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default BrowsePlaces;