
import api from '../api/axios';

export const dashboardService = {
  getUserDashboard: async () => {
    const response = await api.get('/dashboard/user');
    console.log(response)
    return response.data;
  },
  getAdminDashboard: async () => {
    const response = await api.get('/dashboard/admin');
    console.log(response);
    return response.data;
  },
};
