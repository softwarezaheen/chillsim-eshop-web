import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getReferralInfo } from "../../core/apis/referralAPI";

const initialState = {
  referralCode: localStorage.getItem("referred_by") || null,
  discountPercentage: null,
  discountType: null,
  referrerName: null,
  isEligible: false,
  isValidating: false,
  lastValidated: null,
  error: null,
};

/**
 * Validate referral eligibility
 * Called after OTP verification or when user navigates to plans
 * This is our ONLY source of referral discount information
 */
export const validateReferralEligibility = createAsyncThunk(
  "referral/validate",
  async (referralCode, { rejectWithValue }) => {
    if (!referralCode) {
      return rejectWithValue("NO_CODE");
    }

    try {
      const response = await getReferralInfo(referralCode);
      const data = response?.data?.data;
      
      // Store in localStorage for persistence across sessions
      const referralInfo = {
        discountPercentage: data?.percentage,  // API returns 'percentage' not 'discount_percentage'
        discountType: data?.discount_type,
        referrerName: data?.referred_by,  // API returns 'referred_by' not 'referrer_name'
        validatedAt: Date.now(),
      };
      
      localStorage.setItem("referral_info", JSON.stringify(referralInfo));
      
      return referralInfo;
    } catch (error) {
      // 404 means user already purchased or code invalid
      if (error?.response?.status === 404) {
        localStorage.removeItem("referred_by");
        localStorage.removeItem("referral_info");
        return rejectWithValue("NOT_ELIGIBLE");
      }
      return rejectWithValue(error?.message || "VALIDATION_FAILED");
    }
  }
);

const referralSlice = createSlice({
  name: "referral",
  initialState,
  reducers: {
    /**
     * Set referral code from landing page
     */
    setReferralCode: (state, action) => {
      state.referralCode = action.payload;
      state.isValidated = false;
      state.isEligible = false;
      localStorage.setItem("referred_by", action.payload);
    },
    
    /**
     * Clear referral after successful purchase
     */
    clearReferral: (state) => {
      state.referralCode = null;
      state.discountPercentage = null;
      state.discountType = null;
      state.referrerName = null;
      state.isEligible = false;
      state.isValidating = false;
      state.lastValidated = null;
      state.error = null;
      localStorage.removeItem("referred_by");
      localStorage.removeItem("referral_info");
    },
    
    /**
     * Load referral info from localStorage on app mount
     * Only use if validated within last 24 hours
     */
    loadReferralFromStorage: (state) => {
      const storedCode = localStorage.getItem("referred_by");
      const storedInfo = localStorage.getItem("referral_info");
      
      if (storedCode) {
        state.referralCode = storedCode;
      }
      
      if (storedInfo) {
        try {
          const parsed = JSON.parse(storedInfo);
          const age = Date.now() - (parsed.validatedAt || 0);
          
          // Only use if validated within last 24 hours (86400000 ms)
          if (age < 24 * 60 * 60 * 1000) {
            state.discountPercentage = parsed.discountPercentage;
            state.discountType = parsed.discountType;
            state.referrerName = parsed.referrerName;
            state.isEligible = true;
            state.lastValidated = parsed.validatedAt;
          } else {
            // Stale data - clear it
            localStorage.removeItem("referral_info");
          }
        } catch (e) {
          // Invalid JSON - clear it
          localStorage.removeItem("referral_info");
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateReferralEligibility.pending, (state) => {
        state.isValidating = true;
        state.error = null;
      })
      .addCase(validateReferralEligibility.fulfilled, (state, action) => {
        state.isValidating = false;
        state.isEligible = true;
        state.discountPercentage = action.payload?.discountPercentage;
        state.discountType = action.payload?.discountType;
        state.referrerName = action.payload?.referrerName;
        state.lastValidated = action.payload?.validatedAt;
        state.error = null;
      })
      .addCase(validateReferralEligibility.rejected, (state, action) => {
        state.isValidating = false;
        state.isEligible = false;
        state.error = action.payload;
        
        // Clear code if not eligible
        if (action.payload === "NOT_ELIGIBLE") {
          state.referralCode = null;
          state.discountPercentage = null;
          state.discountType = null;
          state.referrerName = null;
        }
      });
  },
});

export const { setReferralCode, clearReferral, loadReferralFromStorage } = referralSlice.actions;
export default referralSlice.reducer;
