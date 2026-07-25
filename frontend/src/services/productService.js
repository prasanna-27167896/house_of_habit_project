import api from '../utils/axiosInstance';

/**
 * Product API Services
 * Standard API calls using axiosInstance
 */

// Fetch paginated products list with query params
export const fetchProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

// Fetch single product details by ID
export const fetchProductById = async (productId) => {
  const response = await api.get(`/products/${productId}`);
  return response.data;
};

// Fetch products filtered by category ID with query params
export const fetchProductsByCategory = async (categoryId, params = {}) => {
  const response = await api.get(`/products/category/${categoryId}`, { params });
  return response.data;
};

// Fetch products grouped by category (for home page)
export const fetchProductsGroupedByCategory = async () => {
  const response = await api.get('/products/grouped-by-category');
  return response.data;
};

// Search products by keyword and query filters
export const searchProducts = async (params = {}) => {
  const response = await api.get('/products/search', { params });
  return response.data;
};
