import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { placeService } from '../../services/place.service';

const AddPlace = () => {
  const [formData, setFormData] = useState({
    name: '', city: '', image: '', latitude: '', longitude: '',
    visitDuration: '', entryFee: '0', priority: '2', description: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        visitDuration: parseFloat(formData.visitDuration),
        entryFee: parseFloat(formData.entryFee),
        priority: parseInt(formData.priority, 10)
      };
      await placeService.addPlace(payload);
      navigate('/admin/places');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add place');
    }
  };

  return (
    <div className="bg-surface p-8 rounded-xl shadow-lg border border-border max-w-3xl mx-auto" style={{ boxShadow: 'var(--shadow-primary)' }}>
      <h2 className="text-3xl font-extrabold text-text mb-8 tracking-tight">Add New Place</h2>
      {error && <div className="text-red-600 mb-6 bg-red-50 p-3 rounded text-center font-medium">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Name</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="block w-full rounded-lg border border-border bg-input-bg text-text focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-colors sm:text-sm p-3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">City</label>
            <input type="text" name="city" required value={formData.city} onChange={handleChange} className="block w-full rounded-lg border border-border bg-input-bg text-text focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-colors sm:text-sm p-3" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">Image URL</label>
          <input type="url" name="image" required value={formData.image} onChange={handleChange} className="block w-full rounded-lg border border-border bg-input-bg text-text focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-colors sm:text-sm p-3" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Latitude</label>
            <input type="number" step="any" name="latitude" required value={formData.latitude} onChange={handleChange} className="block w-full rounded-lg border border-border bg-input-bg text-text focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-colors sm:text-sm p-3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Longitude</label>
            <input type="number" step="any" name="longitude" required value={formData.longitude} onChange={handleChange} className="block w-full rounded-lg border border-border bg-input-bg text-text focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-colors sm:text-sm p-3" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Visit Duration (hrs)</label>
            <input type="number" step="0.5" name="visitDuration" required value={formData.visitDuration} onChange={handleChange} className="block w-full rounded-lg border border-border bg-input-bg text-text focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-colors sm:text-sm p-3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Entry Fee</label>
            <input type="number" name="entryFee" required value={formData.entryFee} onChange={handleChange} className="block w-full rounded-lg border border-border bg-input-bg text-text focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-colors sm:text-sm p-3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Priority</label>
            <select name="priority" value={formData.priority} onChange={handleChange} className="block w-full rounded-lg border border-border bg-input-bg text-text focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-colors sm:text-sm p-3">
              <option value="1">1 (Must)</option>
              <option value="2">2 (Recommended)</option>
              <option value="3">3 (Optional)</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">Description</label>
          <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="block w-full rounded-lg border border-border bg-input-bg text-text focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-colors sm:text-sm p-3"></textarea>
        </div>
        <div className="flex justify-end pt-4">
          <button type="submit" className="text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all" style={{ background: 'var(--gradient-primary)' }}>Save Place</button>
        </div>
      </form>
    </div>
  );
};
export default AddPlace;
