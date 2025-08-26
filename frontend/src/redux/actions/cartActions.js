import instance from "../../api/axios";
import { setCart, setLoading, setError } from "./reducers/cartReducer";

// Add to Cart
export const addToCart = (productId, quantity) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    await instance.post("/cart/add/", { product_id: productId, quantity });
    dispatch(fetchCart());
  } catch (error) {
    console.error('Error adding to cart:', error);
    dispatch(setError('Failed to add item to cart'));
  } finally {
    dispatch(setLoading(false));
  }
};

// Remove from Cart
export const removeFromCart = (itemId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    await instance.delete(`/cart/remove/${itemId}/`);
    dispatch(fetchCart());
  } catch (error) {
    console.error('Error removing from cart:', error);
    dispatch(setError('Failed to remove item from cart'));
  } finally {
    dispatch(setLoading(false));
  }
};

// Update quantity
export const updateCartQuantity = (itemId, quantity) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    await instance.put(`/cart/update/${itemId}/`, { quantity });
    dispatch(fetchCart());
  } catch (error) {
    console.error('Error updating cart:', error);
    dispatch(setError('Failed to update cart quantity'));
  } finally {
    dispatch(setLoading(false));
  }
};

// Fetch Cart
export const fetchCart = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await instance.get("/cart/");
    dispatch(setCart(res.data));
  } catch (error) {
    console.error('Error fetching cart:', error);
    dispatch(setError('Failed to fetch cart'));
    // Set empty cart on error
    dispatch(setCart({ items: [] }));
  } finally {
    dispatch(setLoading(false));
  }
};
