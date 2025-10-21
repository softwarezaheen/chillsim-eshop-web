import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchConfigurationInfoFromAPI } from "../redux-services/configurationServices";
import { system_currency, supportWhatsappPhone } from "../../core/variables/ProjectVariables";

const initialState = {
  system_currency: system_currency,
  user_currency: null,
  login_type: "email",
  otp_channel: ["email"],
  sea_option: true,
  social_login: true,
  allowed_payment_types: ["dcb"],
  whatsapp_number: supportWhatsappPhone,
  bundles_version: null,
  referral_amount: "10",
  referred_discount_percentage: "10",
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
        const configData = action.payload?.data?.data || [];
        
        // Store full configurations in sessionStorage for easy access
        const configurationsObj = {};
        configData.forEach((config) => {
          configurationsObj[config.key] = config.value;
        });
        sessionStorage.setItem("configurations", JSON.stringify(configurationsObj));

        let currency = configData.find((el) => el?.key === "default_currency");
        let paymentTypes = configData.find((el) => el?.key === "allowed_payment_types");
        let loginType = configData.find((el) => el?.key === "login_type");
        let versionId = configData.find((el) => el?.key === "CATALOG.BUNDLES_CACHE_VERSION");
        let referralAmount = configData.find((el) => el?.key === "REFERRAL_CODE_AMOUNT");
        let referredDiscount = configData.find((el) => el?.key === "REFERRED_DISCOUNT_PERCENTAGE");

        state.bundles_version = versionId?.value || null;
        state.login_type = loginType?.value || "email";
        state.referral_amount = referralAmount?.value || "10";
        state.referred_discount_percentage = referredDiscount?.value || "10";
        state.otp_channel = import.meta.env.VITE_APP_OTP_CHANNEL
          ? import.meta.env.VITE_APP_OTP_CHANNEL.split(",")
          : ["email"];
        state.sea_option = import.meta.env.VITE_APP_SEA_OPTION
          ? import.meta.env.VITE_APP_SEA_OPTION === "true"
            ? true
            : false
          : true;
        state.social_login = import.meta.env.VITE_APP_SOCIAL_LOGIN
          ? import.meta.env.VITE_APP_SOCIAL_LOGIN === "true"
            ? true
            : false
          : true;

        let whatsappNumber = configData.find((el) => el?.key === "WHATSAPP_NUMBER");

        state.whatsapp_number = whatsappNumber?.value || supportWhatsappPhone;
        state.system_currency = currency?.value || system_currency;
        state.allowed_payment_types = paymentTypes?.value.split(",") || ["wallet"];
        state.isLoading = false;
      })
      .addCase(fetchCurrencyInfo.rejected, (state, action) => {
        //render config related to env even if configuration api failed
        state.login_type = "email";
        state.bundles_version = "";
        state.otp_channel = import.meta.env.VITE_APP_OTP_CHANNEL
          ? import.meta.env.VITE_APP_OTP_CHANNEL.split(",")
          : ["email"];
        state.sea_option = import.meta.env.VITE_APP_SEA_OPTION
          ? import.meta.env.VITE_APP_SEA_OPTION === "true"
            ? true
            : false
          : true;
        state.social_login = import.meta.env.VITE_APP_SOCIAL_LOGIN
          ? import.meta.env.VITE_APP_SOCIAL_LOGIN === "true"
            ? true
            : false
          : true;
        state.allowed_payment_types = ["dcb"];
        state.system_currency = system_currency;
        state.whatsapp_number = supportWhatsappPhone;
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { UpdateCurrency } = CurrencySlice.actions;
export default CurrencySlice.reducer;
