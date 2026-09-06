import api from '../utils/axiosInstance';

/**
 * Order API Services
 * Endpoints for managing user orders, cancellations, returns, exchanges, tracking, invoices, and delivery feedback.
 */

// ─── Orders List & Details ───────────────────────────────────────────────────

// Fetch customer's orders (supports page, limit, status, startDate, endDate, search)
export const fetchMyOrders = async (params = {}) => {
  const response = await api.get('/orders', { params });
  return response.data; // { status, data: { orders, total, page, limit, totalPages } }
};

// Fetch single order details
export const fetchOrderDetail = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data; // { status, data: orderObject }
};

// Cancel an order
export const cancelOrder = async (orderId, { reason, comment } = {}) => {
  const payload = {};
  if (reason) payload.reason = reason;
  if (comment) payload.comment = comment;
  const response = await api.put(`/orders/${orderId}/cancel`, payload);
  return response.data;
};

// ─── Returns & Exchanges ─────────────────────────────────────────────────────

// Fetch return requests for an order
export const fetchOrderReturns = async (orderId) => {
  const response = await api.get(`/orders/${orderId}/return`);
  return response.data;
};

// Create a return request for an item in a delivered order
export const createOrderReturn = async (orderId, { orderItemId, reasonCategory, reasonDetail, comment }) => {
  const payload = {
    orderItemId,
    reasonCategory,
    reasonDetail,
  };
  if (comment) payload.comment = comment;
  const response = await api.post(`/orders/${orderId}/return`, payload);
  return response.data;
};

// Fetch exchange requests for an order
export const fetchOrderExchanges = async (orderId) => {
  const response = await api.get(`/orders/${orderId}/exchange`);
  return response.data;
};

// Create a size exchange request for an item in a delivered order
export const createOrderExchange = async (orderId, { orderItemId, requestedSize, reasonCategory, reasonDetail }) => {
  const payload = {
    orderItemId,
    requestedSize,
    reasonCategory,
    reasonDetail,
  };
  const response = await api.post(`/orders/${orderId}/exchange`, payload);
  return response.data;
};

// ─── Tracking & Invoice ──────────────────────────────────────────────────────

// Fetch order tracking timeline & status
export const fetchOrderTracking = async (orderId) => {
  const response = await api.get(`/orders/${orderId}/track`);
  return response.data; // { status, data: { orderId, orderStatus, estimatedDelivery, deliveredAt, timeline } }
};

// Download invoice PDF for an order
export const downloadOrderInvoice = async (orderId) => {
  const response = await api.get(`/orders/${orderId}/invoice`, {
    responseType: 'blob',
  });

  // Create blob URL and trigger browser download
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `invoice-${orderId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);

  return true;
};

// ─── Delivery Feedback ───────────────────────────────────────────────────────

// Get delivery feedback for an order
export const fetchDeliveryFeedback = async (orderId) => {
  const response = await api.get(`/orders/${orderId}/delivery-feedback`);
  return response.data;
};

// Submit delivery feedback for an order
export const submitDeliveryFeedback = async (orderId, { rating, comment }) => {
  const payload = { rating: Number(rating) };
  if (comment) payload.comment = comment;
  const response = await api.post(`/orders/${orderId}/delivery-feedback`, payload);
  return response.data;
};
