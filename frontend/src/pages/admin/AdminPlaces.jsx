import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { placeService } from '../../services/place.service';
import { useNavigate } from 'react-router-dom';

const AdminPlaces = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchPlaces = async () => {
    try {
      const data = await placeService.getAllPlaces();
      setPlaces(data);
    } catch (error) {
      console.error('Failed to fetch places', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this place?')) return;
    try {
      await placeService.deletePlace(id);
      setPlaces(places.filter(p => p._id !== id));
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  if (loading) return <div className="text-center mt-20 text-text-muted font-medium">Loading places...</div>;

  return (
    <div className="bg-surface p-8 rounded-xl shadow-lg border border-border">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-text tracking-tight">Manage Places</h2>
        <Link to="/admin/add-place" className="text-white px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all font-semibold" style={{ background: 'var(--gradient-primary)' }}>
          + Add New Place
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {places.map((place) => (
    <div
      key={place._id}
      onClick={() => navigate(`/admin/places/${place._id}`)}
      className="cursor-pointer bg-surface border border-border rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden"
    >
      <img
        src={place.image}
        alt={place.name}
        className="w-full h-40 object-cover"
      />

      <div className="p-4">
        <h3 className="text-lg font-bold text-text">{place.name}</h3>
        <p className="text-sm text-text-muted">{place.city}</p>

        <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
          place.priority === 1
            ? 'bg-red-100 text-red-800'
            : place.priority === 2
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {place.priority === 1 ? 'Must Visit' : place.priority === 2 ? 'Recommended' : 'Optional'}
        </span>
      </div>
    </div>
  ))}
</div>
    </div>
  );
};
export default AdminPlaces;
