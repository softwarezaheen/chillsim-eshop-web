import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchConfigurationInfoFromAPI } from "../redux-services/configurationServices";

const initialState = {
  system_currency: "EUR",
  user_currency: null,
};

//EXPLANATION: I moved the api to authServices to prevent circular dependency
export const fetchCurrencyInfo = createAsyncThunk(
  "currency/fetchSystemCurrency",
  async () => {
    return await fetchConfigurationInfoFromAPI();
  }
);

const CurrencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    UpdateCurrency: (state, action) => {
      return {
        ...state,
        user_currency: action?.payload?.user_currency,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrencyInfo.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrencyInfo.fulfilled, (state, action) => {
        let currency = action.payload?.data?.data?.find(
          (el) => el?.key === "default_currency"
        );
        console.log(
          action.payload,
          action.payload?.data?.data,
          "sysss",
          currency
        );
        state.system_currency = currency?.value || "EUR";
        state.isLoading = false;
      })
      .addCase(fetchCurrencyInfo.rejected, (state, action) => {
        state.system_currency = "EUR";
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { UpdateCurrency } = CurrencySlice.actions;
export default CurrencySlice.reducer;
