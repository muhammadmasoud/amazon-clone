import axios from "axios";

// Add to Cart
export const addToCart = (productId, quantity) => async (dispatch, getState) => {
  const token = localStorage.getItem("token");
  const res = await axios.post("/api/cart/add/", { product_id: productId, quantity }, {
    headers: { Authorization: `Bearer ${token}` }
  });

  dispatch(fetchCart());
};

// Remove from Cart
export const removeFromCart = (itemId) => async (dispatch) => {
  const token = localStorage.getItem("token");
  await axios.delete(`/api/cart/remove/${itemId}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  dispatch(fetchCart());
};

// Fetch Cart
export const fetchCart = () => async (dispatch) => {
  const token = localStorage.getItem("token");
  const res = await axios.get("/api/cart/", {
    headers: { Authorization: `Bearer ${token}` }
  });

  dispatch({ type: "SET_CART", payload: res.data });
};
