import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  total_items: 0,
  subtotal: 0,
  shipping_cost: 0,
  tax_amount: 0,
  discount_amount: 0,
  total_amount: 0,
  promo_code: null,
  cart_count: 0,
  loading: false,
  error: null,
  lastUpdated: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action) => {
      const cartData = action.payload;
      state.items = cartData.items || [];
      state.total_items = cartData.total_items || 0;
      state.subtotal = cartData.subtotal || 0;
      state.shipping_cost = cartData.shipping_cost || 0;
      state.tax_amount = cartData.tax_amount || 0;
      state.discount_amount = cartData.discount_amount || 0;
      state.total_amount = cartData.total_amount || 0;
      state.promo_code = cartData.promo_code || null;
      state.lastUpdated = new Date().toISOString();
      state.error = null;
    },
    setCartCount: (state, action) => {
      state.cart_count = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCart: (state) => {
      state.items = [];
      state.total_items = 0;
      state.subtotal = 0;
      state.shipping_cost = 0;
      state.tax_amount = 0;
      state.discount_amount = 0;
      state.total_amount = 0;
      state.promo_code = null;
      state.cart_count = 0;
      state.lastUpdated = new Date().toISOString();
    },
    updateItemQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find(item => item.id === itemId);
      if (item) {
        item.quantity = quantity;
        // Recalculate totals would normally be done by fetching from server
      }
    },
    removeItem: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter(item => item.id !== itemId);
      state.total_items = state.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    setPromoCode: (state, action) => {
      state.promo_code = action.payload;
    },
    clearPromoCode: (state) => {
      state.promo_code = null;
      state.discount_amount = 0;
    }
  },
});

export const { 
  setCart, 
  setCartCount,
  setLoading, 
  setError, 
  clearError, 
  clearCart,
  updateItemQuantity,
  removeItem,
  setPromoCode,
  clearPromoCode
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.total_amount;
export const selectCartCount = (state) => state.cart.cart_count || state.cart.total_items;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;
export const selectCartSubtotal = (state) => state.cart.subtotal;
export const selectCartShipping = (state) => state.cart.shipping_cost;
export const selectCartTax = (state) => state.cart.tax_amount;
export const selectCartDiscount = (state) => state.cart.discount_amount;
export const selectPromoCode = (state) => state.cart.promo_code;

export default cartSlice.reducer;
