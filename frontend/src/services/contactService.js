import api from '../utils/axiosInstance';

export const submitContactMessage = async (contactData) => {
  const response = await api.post('/contact', contactData);
  return response.data;
};
