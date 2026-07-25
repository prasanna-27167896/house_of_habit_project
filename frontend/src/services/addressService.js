import api from '../utils/axiosInstance';

export const getAddresses = async () => {
  const response = await api.get('/addresses');
  return response.data?.data || response.data;
};

export const createAddress = async (addressData) => {
  const response = await api.post('/addresses', addressData);
  return response.data?.data || response.data;
};

export const updateAddress = async (addressId, addressData) => {
  const response = await api.put(`/addresses/${addressId}`, addressData);
  return response.data?.data || response.data;
};

export const deleteAddress = async (addressId) => {
  const response = await api.delete(`/addresses/${addressId}`);
  return response.data?.data || response.data;
};

export const setDefaultAddress = async (addressId) => {
  const response = await api.patch(`/addresses/${addressId}/default`);
  return response.data?.data || response.data;
};
