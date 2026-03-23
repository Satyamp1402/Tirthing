import api from '../api/axios';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  signup: async (name, email, password, role) => {
    const response = await api.post('/auth/signup', { name, email, password, role });
    return response.data;
  }
};
