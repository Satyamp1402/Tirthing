import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { placeService } from '../../services/place.service';

const AddPlace = () => {
  // const [formData, setFormData] = useState({
  //   name: '', city: '', image: '', latitude: '', longitude: '',
  //   visitDuration: '', entryFee: '0', priority: '2', description: ''
  // });

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
  name: '',
  city: '',
  placeImage: null, // 🔥 important
  latitude: '',
  longitude: '',
  visitDuration: '',
  entryFee: '0',
  priority: '2',
  description: ''
});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit2 = async (e) => {
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

  const handleSubmit3 = async (e) => {
  e.preventDefault();

  try {
    const data = new FormData();

    data.append("name", formData.name);
    data.append("city", formData.city);
    data.append("placeImage", formData.placeImage); // 🔥 must match multer name
    data.append("latitude", parseFloat(formData.latitude));
    data.append("longitude", parseFloat(formData.longitude));
    data.append("visitDuration", parseFloat(formData.visitDuration));
    data.append("entryFee", parseFloat(formData.entryFee));
    data.append("priority", parseInt(formData.priority));
    data.append("description", formData.description);

    await placeService.addPlace(data);

    navigate('/admin/places');

  } catch (err) {
    setError(err.response?.data?.message || 'Failed to add place');
  }
};


const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const data = new FormData();

    if (!formData.placeImage) {
  setError('Please upload an image');
  setLoading(false);
  return;
}

    data.append("name", formData.name);
    data.append("city", formData.city);
    data.append("placeImage", formData.placeImage);
    data.append("latitude", parseFloat(formData.latitude));
    data.append("longitude", parseFloat(formData.longitude));
    data.append("visitDuration", parseFloat(formData.visitDuration));
    data.append("entryFee", parseFloat(formData.entryFee));
    data.append("priority", parseInt(formData.priority));
    data.append("description", formData.description);

    await placeService.addPlace(data);

    navigate('/admin/places');

  } catch (err) {
    setError(err.response?.data?.message || 'Failed to add place');
  } finally {
    setLoading(false);
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
  <label className="block text-sm font-medium text-text-muted mb-2">
    Upload Image
  </label>

  <div className="flex items-center gap-4">
    
    <label
      className="cursor-pointer px-4 py-2 rounded-lg font-medium text-sm transition-all"
      style={{
        background: 'var(--color-primary-soft)',
        color: 'var(--color-primary-hover)',
        border: '1px solid var(--color-border)'
      }}
    >
      Choose File
      <input
  type="file"
  name="placeImage"
  accept="image/*"
  className="hidden"
  onChange={(e) =>
    setFormData({ ...formData, placeImage: e.target.files[0] })
  }
/>
    </label>

    <span className="text-sm text-text-light">
      {formData.placeImage ? formData.placeImage.name : 'No file chosen'}
    </span>
  </div>
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
          <button
  type="submit"
  disabled={loading}
  className="flex items-center justify-center gap-2 text-white px-8 py-3 rounded-lg font-semibold shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
  style={{ background: 'var(--gradient-primary)' }}
>
  {loading && (
    <span
      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
    ></span>
  )}

  {loading ? 'Saving...' : 'Save Place'}
</button>
        </div>
      </form>
    </div>
  );
};
export default AddPlace;
