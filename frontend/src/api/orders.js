import instance from './axios';

// Get user's order history
export const getUserOrderHistory = () => {
  return instance.get('/orders/history/');
};

// Get specific order details
export const getOrderDetails = (orderId) => {
  return instance.get(`/orders/${orderId}/`);
};

// Place a new order (checkout)
export const placeOrder = (orderData) => {
  return instance.post('/orders/', orderData);
};
