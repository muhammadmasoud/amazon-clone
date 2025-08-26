import * as cartAPI from "../../api/cart";
import { setCart, setLoading, setError, setCartCount } from "./reducers/cartReducer";

// Fetch Cart with enhanced data
export const fetchCart = (summary = false) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await cartAPI.getCart(summary);
    dispatch(setCart(response.data));
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    const errorMessage = error.response?.data?.detail || 'Failed to fetch cart';
    dispatch(setError(errorMessage));
    // Set empty cart on error
    dispatch(setCart({ 
      items: [], 
      total_items: 0, 
      subtotal: 0, 
      total_amount: 0 
    }));
  } finally {
    dispatch(setLoading(false));
  }
};

// Get cart count for navbar
export const fetchCartCount = () => async (dispatch) => {
  try {
    const response = await cartAPI.getCartCount();
    dispatch(setCartCount(response.data.count));
    return response.data.count;
  } catch (error) {
    console.error('Error fetching cart count:', error);
    dispatch(setCartCount(0));
  }
};

// Add to Cart with enhanced validation
export const addToCart = (productId, quantity = 1) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await cartAPI.addToCart(productId, quantity);
    
    // Show success message
    dispatch(setError(''));
    
    // Refresh cart data
    await dispatch(fetchCart());
    await dispatch(fetchCartCount());
    
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.detail || 
                        'Failed to add item to cart';
    dispatch(setError(errorMessage));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

// Remove from Cart
export const removeFromCart = (itemId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await cartAPI.removeFromCart(itemId);
    
    // Refresh cart data
    await dispatch(fetchCart());
    await dispatch(fetchCartCount());
    
    return response.data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    const errorMessage = error.response?.data?.error || 'Failed to remove item from cart';
    dispatch(setError(errorMessage));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

// Update quantity with validation
export const updateCartQuantity = (itemId, quantity) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await cartAPI.updateCartQuantity(itemId, quantity);
    
    // Refresh cart data
    await dispatch(fetchCart());
    await dispatch(fetchCartCount());
    
    return response.data;
  } catch (error) {
    console.error('Error updating cart:', error);
    const errorMessage = error.response?.data?.error || 'Failed to update cart quantity';
    dispatch(setError(errorMessage));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

// Clear entire cart
export const clearCart = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await cartAPI.clearCart();
    
    // Set empty cart
    dispatch(setCart({ 
      items: [], 
      total_items: 0, 
      subtotal: 0, 
      total_amount: 0 
    }));
    dispatch(setCartCount(0));
    
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    const errorMessage = error.response?.data?.error || 'Failed to clear cart';
    dispatch(setError(errorMessage));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

// Apply promo code
export const applyPromoCode = (promoCode) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await cartAPI.applyPromoCode(promoCode);
    
    // Refresh cart to show updated totals
    await dispatch(fetchCart());
    
    return response.data;
  } catch (error) {
    console.error('Error applying promo code:', error);
    const errorMessage = error.response?.data?.error || 'Failed to apply promo code';
    dispatch(setError(errorMessage));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

// Remove promo code
export const removePromoCode = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await cartAPI.removePromoCode();
    
    // Refresh cart to show updated totals
    await dispatch(fetchCart());
    
    return response.data;
  } catch (error) {
    console.error('Error removing promo code:', error);
    const errorMessage = error.response?.data?.error || 'Failed to remove promo code';
    dispatch(setError(errorMessage));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

// Helper action to add item with toast notification
export const addToCartWithNotification = (product, quantity = 1) => async (dispatch) => {
  try {
    // Validate before adding
    cartAPI.validateCartItem(product, quantity);
    
    const result = await dispatch(addToCart(product.id, quantity));
    
    // You can add toast notification here
    return {
      success: true,
      message: `Added ${product.title} to cart`,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to add item to cart',
      error: error
    };
  }
};
