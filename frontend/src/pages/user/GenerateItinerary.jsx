import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itineraryService } from '../../services/itinerary.service';
import { useLocation } from 'react-router-dom';
import { MapPin, CalendarDays, Wallet, Users } from 'lucide-react';

const GenerateItinerary = () => {
  const location = useLocation();

  

  const [formData, setFormData] = useState({
    destination: location.state?.city || '',
    days: 1,
    budget: '',
    groupSize: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...formData,
        days: parseInt(formData.days, 10),
        budget: parseFloat(formData.budget),
        groupSize: parseInt(formData.groupSize, 10)
      };
      const data = await itineraryService.generateItinerary(payload);
      navigate(`/itinerary/${data.itinerary._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate itinerary. Try increasing budget or checking destination.');
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="max-w-2xl mx-auto bg-surface p-8 rounded-xl border border-border" style={{ boxShadow: 'var(--shadow-primary)' }}>
      <div className="text-center mb-10">
  <h1 className="text-4xl font-extrabold text-text mb-3">
    ✨ Plan Your Perfect Pilgrimage
  </h1>
  <p className="text-text-muted max-w-xl mx-auto">
    Get a personalized itinerary based on your budget, time, and group size.
  </p>
</div>
      {error && <div className="bg-red-100/50 text-red-600 font-medium p-4 mb-6 rounded-lg text-sm text-center">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">Destination City (e.g. Varanasi)</label>
          <input type="text" name="destination" required value={formData.destination} onChange={handleChange}
            className="w-full px-4 py-3 bg-input-bg border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors focus:outline-none" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Number of Days</label>
            <input type="number" min="1" max="14" name="days" required value={formData.days} onChange={handleChange}
              className="w-full px-4 py-3 bg-input-bg border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Total Budget (₹)</label>
            <input type="number" min="1000" name="budget" required value={formData.budget} onChange={handleChange}
              className="w-full px-4 py-3 bg-input-bg border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Group Size</label>
            <input type="number" min="1" max="50" name="groupSize" required value={formData.groupSize} onChange={handleChange}
              className="w-full px-4 py-3 bg-input-bg border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors focus:outline-none" />
          </div>
        </div>
        <div className="pt-4">
          <button type="submit" disabled={loading}
            className={`w-full flex justify-center py-4 px-4 rounded-lg shadow-md hover:shadow-lg transition-all text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${loading ? 'opacity-70 cursor-not-allowed mx-auto' : ''}`}
            style={{ background: 'var(--gradient-primary)' }}>
            {loading ? 'Generating Optimal Route...' : 'Generate Itinerary'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default GenerateItinerary;
