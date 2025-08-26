import instance from './axios';

// Get user's cart with full details
export const getCart = (summary = false) => {
  const params = summary ? { summary: 'true' } : {};
  return instance.get('/cart/', { params });
};

// Get cart items count for navbar
export const getCartCount = () => {
  return instance.get('/cart/count/');
};

// Add product to cart
export const addToCart = (productId, quantity = 1) => {
  return instance.post('/cart/add/', {
    product_id: productId,
    quantity: quantity
  });
};

// Update cart item quantity
export const updateCartQuantity = (itemId, quantity) => {
  return instance.patch(`/cart/update/${itemId}/`, {
    quantity: quantity
  });
};

// Remove item from cart
export const removeFromCart = (itemId) => {
  return instance.delete(`/cart/remove/${itemId}/`);
};

// Clear entire cart
export const clearCart = () => {
  return instance.delete('/cart/clear/');
};

// Apply promo code
export const applyPromoCode = (promoCode) => {
  return instance.post('/cart/promo/apply/', {
    promo_code: promoCode
  });
};

// Remove promo code
export const removePromoCode = () => {
  return instance.delete('/cart/promo/remove/');
};

// Cart validation helper
export const validateCartItem = (product, quantity) => {
  if (!product) {
    throw new Error('Product is required');
  }
  
  if (quantity < 1) {
    throw new Error('Quantity must be at least 1');
  }
  
  if (quantity > product.stock) {
    throw new Error(`Only ${product.stock} items available in stock`);
  }
  
  return true;
};
