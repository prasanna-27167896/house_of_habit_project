import api from '../utils/axiosInstance';

export const fetchCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const fetchCategoryById = async (categoryId) => {
  const response = await api.get(`/categories/${categoryId}`);
  return response.data;
};
