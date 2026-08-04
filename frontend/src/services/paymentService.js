import api from '../utils/axiosInstance';

/**
 * Initiate a Razorpay payment order for the cart.
 * @param {Object} data - { addressId, couponCode }
 * @returns {Promise<Object>} - { orderId, razorpayOrderId, amount, currency, keyId }
 */
export const initiatePayment = async (data) => {
  const response = await api.post('/payment/initiate', data);
  return response.data?.data || response.data;
};

/**
 * Verify a Razorpay online payment signature.
 * @param {Object} data - { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature }
 * @returns {Promise<Object>} - { status, order } (status: 'CONFIRMED' | 'PENDING_WEBHOOK')
 */
export const verifyPayment = async (data) => {
  const response = await api.post('/payment/verify', data);
  return response.data?.data || response.data;
};

/**
 * Place a Cash on Delivery (COD) order.
 * @param {Object} data - { addressId, couponCode }
 * @returns {Promise<Object>} - Placed order details
 */
export const placeCODOrder = async (data) => {
  const response = await api.post('/payment/cod', data);
  return response.data?.data || response.data;
};

/**
 * Poll payment status for an order.
 * @param {string} orderId - The backend order UUID
 * @returns {Promise<Object>} - Order status details
 */
export const getPaymentStatus = async (orderId) => {
  const response = await api.get(`/payment/status/${orderId}`);
  return response.data?.data || response.data;
};

/**
 * Initiate a Razorpay payment order for a single cart item.
 * @param {string} cartItemId
 * @param {Object} data - { addressId, couponCode }
 * @returns {Promise<Object>}
 */
export const initiatePaymentSingle = async (cartItemId, data) => {
  const response = await api.post(`/payment/initiate/single/${cartItemId}`, data);
  return response.data?.data || response.data;
};

/**
 * Place a Cash on Delivery (COD) order for a single cart item.
 * @param {string} cartItemId
 * @param {Object} data - { addressId, couponCode }
 * @returns {Promise<Object>}
 */
export const placeCODOrderSingle = async (cartItemId, data) => {
  const response = await api.post(`/payment/cod/single/${cartItemId}`, data);
  return response.data?.data || response.data;
};
