import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { placeService } from '../../services/place.service';

const EditPlace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({});

  useEffect(() => {
    const fetchPlace = async () => {
      const data = await placeService.getPlaceById(id);
      setForm(data);
    };
    fetchPlace();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await placeService.updatePlace(id, form);
    navigate(`/admin/places/${id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-surface p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Edit Place</h2>

      <input name="name" value={form.name || ''} onChange={handleChange} className="input" placeholder="Name" />
      <input name="city" value={form.city || ''} onChange={handleChange} className="input" placeholder="City" />
      <input name="image" value={form.image || ''} onChange={handleChange} className="input" placeholder="Image URL" />

      <textarea name="description" value={form.description || ''} onChange={handleChange} className="input" placeholder="Description" />

      <button type="submit" className="mt-4 bg-green-500 text-white px-4 py-2 rounded">
        Update Place
      </button>
    </form>
  );
};

export default EditPlace;