import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { placeService } from "../../services/place.service";

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
      <div className="max-w-4xl mx-auto bg-surface p-6 rounded-2xl border border-border shadow-(--shadow-primary)">

        <img
          src={place.image}
          className="w-full h-72 object-cover rounded-xl mb-6"
        />

        <h1 className="text-3xl font-bold text-text">{place.name}</h1>
        <p className="text-text-muted">{place.city}</p>

        <p className="mt-4 text-text">{place.description}</p>

        <div className="mt-6 text-sm text-text-muted flex gap-6">
          <span>⏱ {place.visitDuration} hrs</span>
          <span>₹ {place.entryFee}</span>
        </div>

        {/* 🔥 MAIN BUTTON */}
        <button
          onClick={() =>
            navigate("/generate-itinerary", {
              state: { city: place.city }
            })
          }
          className="mt-8 px-6 py-3 rounded-lg text-white font-semibold
          shadow-(--shadow-primary) hover:opacity-90 transition-all"
          style={{ background: "var(--gradient-primary)" }}
        >
          Generate Itinerary for {place.city}
        </button>

      </div>
    </div>
  );
};

export default UserPlaceDetails;