import api from '../utils/axiosInstance';

/**
 * Review API Services
 * Handles product reviews and 2-step direct Cloudflare R2 photo uploads
 */

// Step 1: Request presigned PUT URL for review image upload
export const presignReviewUpload = async ({ contentType, fileSize }) => {
  const response = await api.post('/upload/presign-review', {
    contentType,
    fileSize,
  });
  return response.data; // { status, data: { signedUrl, key, publicUrl } }
};

// Step 2: Upload raw file directly to Cloudflare R2 using presigned URL
// Note: Plain fetch must be used to avoid sending Authorization headers to Cloudflare
export const uploadFileToR2 = async (signedUrl, file) => {
  const response = await fetch(signedUrl, {
    method: 'PUT',
    body: file, // raw File object
    headers: {
      'Content-Type': file.type, // exactly matches contentType requested in Step 1
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to upload photo to storage. Status: ${response.status}`);
  }

  return true;
};

// Full helper to upload review photo in two steps
export const uploadReviewPhoto = async (file) => {
  if (!file) return null;
  const presignRes = await presignReviewUpload({
    contentType: file.type,
    fileSize: file.size,
  });

  const { signedUrl, key, publicUrl } = presignRes.data || presignRes;

  await uploadFileToR2(signedUrl, file);

  return { imageUrl: publicUrl, imageKey: key };
};

// Create a review for a product
export const createProductReview = async (productId, { rating, title, body, imageUrl, imageKey }) => {
  const payload = { rating: Number(rating) };
  if (title) payload.title = title;
  if (body) payload.body = body;
  if (imageUrl && imageKey) {
    payload.imageUrl = imageUrl;
    payload.imageKey = imageKey;
  }

  const response = await api.post(`/reviews/product/${productId}`, payload);
  return response.data;
};

// Get reviews for a product
export const getProductReviews = async (productId, params = {}) => {
  const response = await api.get(`/reviews/product/${productId}`, { params });
  return response.data;
};

// Update existing review
export const updateProductReview = async (reviewId, data) => {
  const response = await api.put(`/reviews/${reviewId}`, data);
  return response.data;
};

// Delete review
export const deleteProductReview = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};
