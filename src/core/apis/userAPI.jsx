import { api } from "./axios";

export const assignBundle = async (payload) => {
  try {
    const res = await api.post(`api/v1/user/bundle/assign`, payload);
    return res;
  } catch (error) {
    throw error;
  }
};

export const assignTopupBundle = async (payload) => {
  try {
    const res = await api.post(`api/v1/user/bundle/assign-top-up`, payload);
    return res;
  } catch (error) {
    throw error;
  }
};

export const getTaxes = async (bundleCode, promoCode = null) => {
  try {
    const params = {};
    if (promoCode) {
      params.promo_code = promoCode;
    }
    const res = await api.get(`api/v1/user/bundle/get-taxes/${bundleCode}`, { params });
    return res;
  } catch (error) {
    throw error;
  }
};

export const getOrderByID = async (payload) => {
  try {
    const res = await api.get(`api/v1/user/my-esim-by-order/${payload}`, {
      params: { ...payload },
    });
    return res;
  } catch (error) {
    throw error;
  }
};

export const getOrdersHistory = async (payload) => {
  try {
    const res = await api.get(`api/v1/user/order-history`, {
      params: { ...payload },
    });
    return res;
  } catch (error) {
    throw error;
  }
};

export const getOrderHistoryById = async (payload) => {
  try {
    const res = await api.get(`api/v1/user/order-history/${payload}`, {
      params: { ...payload },
    });
    return res;
  } catch (error) {
    throw error;
  }
};

export const getUserNotifications = async (payload) => {
  try {
    const res = await api.get(`api/v1/user/user-notification`, {
      params: { ...payload },
    });
    return res;
  } catch (error) {
    throw error;
  }
};

export const getMyEsim = async (payload) => {
  try {
    const res = await api.get(`api/v1/user/my-esim`, {
      params: { ...payload },
    });
    return res;
  } catch (error) {
    throw error;
  }
};

export const getMyEsimByIccid = async (payload) => {
  try {
    const res = await api.get(`api/v1/user/my-esim/${payload}`);
    return res;
  } catch (error) {
    throw error;
  }
};

export const getEsimRelatedTopup = async ({ bundle_code, iccid }) => {
  try {
    const res = await api.get(
      `api/v1/user/related-topup/${bundle_code}/${iccid}`
    );
    return res;
  } catch (error) {
    throw error;
  }
};

export const updateBundleLabelByIccid = async (payload) => {
  try {
    const res = await api.post(
      `api/v1/user/bundle-label-by-iccid/${payload?.code}`,
      {
        ...payload,
      }
    );
    return res;
  } catch (error) {
    throw error;
  }
};

export const checkBundleExist = async (payload) => {
  try {
    const res = await api.get(`api/v1/user/bundle-exists/${payload}`);
    return res;
  } catch (error) {
    throw error;
  }
};

export const getMyEsimConsumption = async (payload) => {
  try {
    const res = await api.get(`api/v1/user/consumption/${payload}`);
    return res;
  } catch (error) {
    throw error;
  }
};

export const markAsRead = async (payload) => {
  try {
    const res = await api.post(`api/v1/user/read-user-notification/`);
    return res;
  } catch (error) {
    throw error;
  }
};

export const verifyOrderOTP = async (payload) => {
  try {
    const res = await api.post(`api/v1/user/bundle/verify_order_otp`, payload);
    return res;
  } catch (error) {
    throw error;
  }
};

export const getBillingInfo = async (payload) => {
  try {
    const res = await api.get(`api/v1/user/get-billing-info`, {
      params: { ...payload },
    });
    return res;
  } catch (error) {
    throw error;
  }
};

export const saveBillingInfo = async (payload) => {
  try {
    const res = await api.post(`api/v1/user/save-billing-info`, payload);
    return res;
  } catch (error) {
    throw error;
  }
};

// ===================== Auto Top-Up APIs =====================

export const enableAutoTopup = async (payload) => {
  try {
    const res = await api.post(`api/v1/user/auto-topup/enable`, payload);
    return res;
  } catch (error) {
    throw error;
  }
};

export const disableAutoTopup = async (payload) => {
  try {
    const res = await api.post(`api/v1/user/auto-topup/disable`, payload);
    return res;
  } catch (error) {
    throw error;
  }
};

export const getAutoTopupConfig = async (iccid) => {
  try {
    const res = await api.get(`api/v1/user/auto-topup/${iccid}`);
    return res;
  } catch (error) {
    throw error;
  }
};

export const getAutoTopupConfigs = async () => {
  try {
    const res = await api.get(`api/v1/user/auto-topup`);
    return res;
  } catch (error) {
    throw error;
  }
};

export const updateAutoTopupConfig = async ({ iccid, ...payload }) => {
  try {
    const res = await api.put(`api/v1/user/auto-topup/${iccid}`, payload);
    return res;
  } catch (error) {
    throw error;
  }
};

// ===================== Payment Method APIs =====================

export const getPaymentMethods = async () => {
  try {
    const res = await api.get(`api/v1/user/payment-methods`);
    return res;
  } catch (error) {
    throw error;
  }
};

export const setDefaultPaymentMethod = async (pmId) => {
  try {
    const res = await api.post(`api/v1/user/payment-methods/${pmId}/default`);
    return res;
  } catch (error) {
    throw error;
  }
};

export const deletePaymentMethod = async (pmId) => {
  try {
    const res = await api.delete(`api/v1/user/payment-methods/${pmId}`);
    return res;
  } catch (error) {
    throw error;
  }
};

export const syncPaymentMethods = async () => {
  try {
    const res = await api.post(`api/v1/user/payment-methods/sync`);
    return res;
  } catch (error) {
    throw error;
  }
};

/**
 * Check if user has complete billing information.
 * Required fields for individual: firstName, lastName, country, state, city
 * Required fields for business (companyName OR vatCode present): above + companyName, vatCode
 * 
 * @returns {Promise<boolean>} true if billing info is complete, false otherwise
 */
export const hasBillingInfo = async () => {
  try {
    const res = await getBillingInfo();
    const data = res?.data?.data;
    
    if (!data) return false;
    
    // Check base required fields for individual
    const hasBaseFields = !!(
      data.firstName?.trim() &&
      data.lastName?.trim() &&
      data.country?.trim() &&
      data.state?.trim() &&
      data.city?.trim()
    );
    
    if (!hasBaseFields) return false;
    
    // Check if this is a business account (either companyName or vatCode is present)
    const isBusiness = !!(data.companyName?.trim() || data.vatCode?.trim());
    
    if (isBusiness) {
      // Business requires both companyName AND vatCode
      return !!(data.companyName?.trim() && data.vatCode?.trim());
    }
    
    return true;
  } catch (error) {
    console.error("Error checking billing info:", error);
    return false;
  }
};
