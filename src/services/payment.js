import api from './api';

export const paymentService = {
  createOrder: async (orderData) => {
    const response = await api.post('/payments/create-order', orderData);
    return response.data;
  },

  verifyPayment: async (paymentData) => {
    const response = await api.post('/payments/verify', paymentData);
    return response.data;
  },

  getMyBookings: async () => {
    const response = await api.get('/payments/my-bookings');
    return response.data;
  }
};
