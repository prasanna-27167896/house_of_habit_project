import api from '../utils/axiosInstance';

/**
 * Cart API Services
 * Standard API calls using axiosInstance
 */

// Get user's cart
export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

// Add item to cart
export const addToCart = async (variantId, quantity = 1) => {
  const response = await api.post('/cart', { variantId, quantity });
  return response.data;
};

// Update cart item quantity
export const updateCartItem = async (cartItemId, quantity) => {
  const response = await api.put(`/cart/items/${cartItemId}`, { quantity });
  return response.data;
};

// Remove single item from cart
export const removeFromCart = async (cartItemId) => {
  const response = await api.delete(`/cart/items/${cartItemId}`);
  return response.data;
};

// Clear entire cart
export const clearCart = async () => {
  const response = await api.delete('/cart');
  return response.data;
};
