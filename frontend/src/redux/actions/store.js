import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./reducers/cartReducer";

const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});

export default store;
