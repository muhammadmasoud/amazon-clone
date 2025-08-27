// Simple API test file
import { placeOrder } from './api/orders.js';

// Test data
const testOrderData = {
  cart: [
    {
      product_id: 8, // Mouse
      quantity: 1
    }
  ],
  payment_method: 'cash_on_delivery',
  shipping_address: '16 st. 2ably sahely road',
  shipping_city: 'Alexandria',
  shipping_state: 'Alexandria',
  shipping_zip: '21629',
  shipping_phone: '01098384618'
};

// Test function
export const testPlaceOrder = async () => {
  try {
    console.log('Testing place order API...');
    console.log('Test data:', testOrderData);
    
    const response = await placeOrder(testOrderData);
    console.log('API Response:', response);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    console.error('Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    throw error;
  }
};

// Export for use in console
window.testPlaceOrder = testPlaceOrder;
