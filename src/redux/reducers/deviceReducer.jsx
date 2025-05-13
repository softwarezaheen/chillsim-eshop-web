import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  authenticated_fcm_token: null,
  anonymous_fcm_token: null,
  x_device_id: null,
  new_notification: false,
};

const DeviceSlice = createSlice({
  name: "device",
  initialState,
  reducers: {
    AttachDevice: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    DetachDevice: (state, action) => {
      return {
        ...initialState,
      };
    },
  },
});

export const { AttachDevice, DetachDevice } = DeviceSlice.actions;
export default DeviceSlice.reducer;
