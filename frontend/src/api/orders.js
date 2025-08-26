import instance from './axios';

// Get user's order history with filtering
export const getUserOrderHistory = (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);
  
  return instance.get(`/orders/history/?${params.toString()}`);
};

// Get specific order details
export const getOrderDetails = (orderId) => {
  return instance.get(`/orders/${orderId}/`);
};

// Place a new order (enhanced checkout)
export const placeOrder = (orderData) => {
  return instance.post('/orders/', orderData);
};

// Cancel an order
export const cancelOrder = (orderId) => {
  return instance.post(`/orders/${orderId}/cancel/`);
};

// Track order by order number (public endpoint)
export const trackOrder = (orderNumber) => {
  return instance.get(`/track/${orderNumber}/`);
};

// Admin endpoints (require admin privileges)
export const adminGetOrders = (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.is_paid !== undefined) params.append('is_paid', filters.is_paid);
  if (filters.payment_method) params.append('payment_method', filters.payment_method);
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);
  if (filters.search) params.append('search', filters.search);
  
  return instance.get(`/admin/orders/?${params.toString()}`);
};

// Admin get dashboard stats
export const getAdminDashboardStats = (days = 30) => {
  return instance.get(`/admin/dashboard/stats/?days=${days}`);
};

// Admin update order status
export const updateOrderStatus = (orderId, updateData) => {
  return instance.patch(`/admin/orders/${orderId}/status/`, updateData);
};

// Order status helpers
export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    packed: 'bg-purple-100 text-purple-800',
    shipped: 'bg-orange-100 text-orange-800',
    out_for_delivery: 'bg-pink-100 text-pink-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    returned: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusIcon = (status) => {
  const icons = {
    pending: '⏳',
    confirmed: '✅',
    processing: '⚙️',
    packed: '📦',
    shipped: '🚚',
    out_for_delivery: '🛻',
    delivered: '✅',
    cancelled: '❌',
    returned: '↩️'
  };
  return icons[status] || '📋';
};
