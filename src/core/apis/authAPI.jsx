import supabase from "../supabase/SupabaseClient";
import { api } from "./axios";

export const userLimitedLogin = async (payload) => {
  try {
    const res = await api.post(`api/v1/auth/tmp-login`, payload);
    return res;
  } catch (error) {
    return error;
  }
};

export const userLogin = async (payload) => {
  try {
    const res = await api.post(`api/v1/auth/login`, payload);
    return res;
  } catch (error) {
    throw error;
  }
};

export const resendOrderOTP = async (payload) => {
  console.log(payload, "pppppp");
  try {
    const res = await api.post(
      `api/v1/user/bundle/resend_order_otp/${payload}`
    );
    return res;
  } catch (error) {
    throw error;
  }
};

export const verifyOTP = async (payload) => {
  try {
    const res = await api.post(`api/v1/auth/verify_otp`, payload);
    return res;
  } catch (error) {
    throw error;
  }
};

export const userLogout = async (payload) => {
  try {
    const res = await api.post(`api/v1/auth/logout`, {
      params: { ...payload },
    });
    return res;
  } catch (error) {
    throw error;
  }
};

export const getUserInfo = async (payload) => {
  try {
    const res = await api.get(`api/v1/auth/user-info`, {
      params: { ...payload },
    });
    return res;
  } catch (error) {
    return error;
  }
};

export const isUserLoggedIn = async (payload) => {
  try {
    const res = await api.get(`api/v1/auth/validate-token`, {
      params: { ...payload },
    });
    return res;
  } catch (error) {
    throw error;
  }
};

export const refreshToken = async (payload) => {
  try {
    const res = await api.post(`api/v1/auth/refresh-token`, {
      params: { ...payload },
    });
    return res;
  } catch (error) {
    throw error;
  }
};

export const updateUserInfo = async (payload) => {
  try {
    const res = await api.post(`api/v1/auth/user-info`, payload);
    return res;
  } catch (error) {
    throw error;
  }
};

export const deleteAccount = async (payload) => {
  try {
    const res = await api.delete(`api/v1/auth/delete-account`, {
      data: { ...payload },
    });
    return res;
  } catch (error) {
    throw error;
  }
};

export const supabaseSignout = async () => {
  await supabase.auth.signOut();
};

export const getInvoicePDF = async (invoiceId) => {
  try {
    const res = await api.get(`api/v1/user/invoice/${invoiceId}`, {
      responseType: 'blob', // Important for PDF handling
      headers: {
        'Accept': 'application/pdf'
      }
    });
    return res;
  } catch (error) {
    console.error("getInvoicePDF API error:", error);
    throw error;
  }
};
