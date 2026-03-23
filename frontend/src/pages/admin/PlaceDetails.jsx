import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { placeService } from '../../services/place.service';

const PlaceDetails = () => {
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

  const handleDelete = async () => {
    if (!window.confirm("Delete this place?")) return;
    await placeService.deletePlace(id);
    navigate('/admin/places');
  };

  if (!place) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto bg-surface p-6 rounded-xl shadow">
      <img src={place.image} className="w-full h-64 object-cover rounded-lg mb-4" />

      <h1 className="text-3xl font-bold">{place.name}</h1>
      <p className="text-text-muted">{place.city}</p>

      <p className="mt-4">{place.description}</p>

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => navigate(`/admin/places/edit/${id}`)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Edit
        </button>

        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default PlaceDetails;