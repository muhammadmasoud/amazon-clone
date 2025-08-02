const initialState = {
  items: [],
};

export default function cartReducer(state = initialState, action) {
  switch (action.type) {
    case "SET_CART":
      return { ...state, items: action.payload.items };
    default:
      return state;
  }
}
