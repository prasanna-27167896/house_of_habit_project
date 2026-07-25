import api from '../utils/axiosInstance';

export const fetchFaqs = async () => {
  const response = await api.get('/faqs');
  return response.data;
};
