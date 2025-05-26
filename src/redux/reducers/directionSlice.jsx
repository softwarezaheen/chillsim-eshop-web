// src/store/directionSlice.jsx
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  direction: "ltr",
};

const directionSlice = createSlice({
  name: "direction",
  initialState,
  reducers: {
    setDirection: (state, action) => {
      state.direction = action.payload;
    },
  },
});

export const { setDirection } = directionSlice.actions;
export default directionSlice.reducer;
