import api from '../api/axios';

export const placeService = {
  getAllPlaces: async () => {
    const response = await api.get('/place/all');
    return response.data;
  },
  
  addPlace: async (payload) => {
    const response = await api.post('/place/add', payload, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  },

  updatePlace: async (id, payload) => {
    const response = await api.put(`/place/${id}`, payload, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  },
  getPlaceById: async (id) => {
  const res = await api.get(`/place/${id}`);
  return res.data;
},
  deletePlace: async (id) => {
    const response = await api.delete(`/place/${id}`);
    return response.data;
  }
};
