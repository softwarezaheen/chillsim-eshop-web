import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  order: {},
};

const OrderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    AttachOrder: (state, action) => {
      return {
        ...state,
        order: {
          ...action.payload,
        },
      };
    },
    DetachOrder: (state, action) => {
      return {
        ...state,
        ...initialState,
      };
    },
  },
});

export const { AttachOrder, DetachOrder } = OrderSlice.actions;
export default OrderSlice.reducer;
