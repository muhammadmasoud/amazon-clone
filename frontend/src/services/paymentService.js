import api from '../api/axios';

export const paymentService = {
  // Create payment intent
  createPaymentIntent: async (orderId) => {
    try {
      const response = await api.post('/payments/create-payment-intent/', {
        order_id: orderId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Confirm payment
  confirmPayment: async (paymentIntentId, paymentId) => {
    try {
      const response = await api.post('/payments/confirm-payment/', {
        payment_intent_id: paymentIntentId,
        payment_id: paymentId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get payment status
  getPaymentStatus: async (paymentId) => {
    try {
      const response = await api.get(`/payments/payment-status/${paymentId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user payments
  getUserPayments: async () => {
    try {
      const response = await api.get('/payments/user-payments/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get Stripe config
  getStripeConfig: async () => {
    try {
      const response = await api.get('/payments/stripe-config/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
