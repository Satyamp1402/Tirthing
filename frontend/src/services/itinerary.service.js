import api from '../api/axios';

export const itineraryService = {
  generateItinerary: async (payload) => {
    const response = await api.post('/itinerary/generate', payload);
    return response.data;
  },
  getMyItineraries: async () => {
    const response = await api.get('/itinerary/my');
    return response.data;
  }
};
