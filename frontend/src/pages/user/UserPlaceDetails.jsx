import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { placeService } from "../../services/place.service";
import MapView from "../../components/common/MapView";

const UserPlaceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);

  useEffect(() => {
    const fetchPlace = async () => {
      const data = await placeService.getPlaceById(id);
      setPlace(data);
    };
    fetchPlace();
  }, [id]);

  if (!place) return <div className="p-6 text-text">Loading...</div>;

  return (
    <div className="min-h-screen bg-bg py-10 px-4">

      {/* 🔥 HERO SECTION */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="relative h-80 rounded-2xl overflow-hidden shadow-(--shadow-primary)">
          <img
            src={place.image}
            alt={place.name}
            className="w-full h-full object-cover"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />

          {/* Text Overlay */}
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-3xl font-bold">{place.name}</h1>
            <p className="text-sm opacity-90">{place.city}</p>
          </div>
        </div>
      </div>

      {/* 🔥 MAIN CONTENT */}
      <div className="max-w-5xl mx-auto bg-surface p-6 rounded-2xl border border-border shadow-(--shadow-primary)">

        {/* ✅ INFO CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-bg p-4 rounded-xl text-center">
            <p className="text-lg font-semibold text-text">⏱</p>
            <p className="text-sm text-text-muted">Duration</p>
            <p className="text-text font-medium">{place.visitDuration} hrs</p>
          </div>

          <div className="bg-bg p-4 rounded-xl text-center">
            <p className="text-lg font-semibold text-text">💰</p>
            <p className="text-sm text-text-muted">Entry Fee</p>
            <p className="text-text font-medium">₹ {place.entryFee}</p>
          </div>

          <div className="bg-bg p-4 rounded-xl text-center">
            <p className="text-lg font-semibold text-text">📍</p>
            <p className="text-sm text-text-muted">City</p>
            <p className="text-text font-medium">{place.city}</p>
          </div>
        </div>

        {/* ✅ DESCRIPTION */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-text mb-2">
            Description:
          </h2>
          <p className="text-text-muted leading-relaxed">
            {place.description}
          </p>
        </div>

        {/* ✅ MAP SECTION */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-text mb-4">
            📍 Location
          </h2>

          <MapView
            latitude={place.latitude}
            longitude={place.longitude}
            name={place.city}
          />
        </div>

        {/* 🔥 CTA BUTTON (MOVED TO END) */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={() =>
              navigate("/generate-itinerary", {
                state: { city: place.city }
              })
            }
            className="px-6 py-3 rounded-lg text-white font-semibold
            shadow-(--shadow-primary) hover:opacity-90 transition-all"
            style={{ background: "var(--gradient-primary)" }}
          >
            Generate Itinerary for {place.city}
          </button>
        </div>

      </div>
    </div>
  );
};

export default UserPlaceDetails;