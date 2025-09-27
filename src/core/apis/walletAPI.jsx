import { api } from "./axios";

export const redeemVoucher = async (payload) => {
  try {
    const res = await api.post(`api/v1/voucher/redeem`, payload);
    return res;
  } catch (error) {
    throw error;
  }
};