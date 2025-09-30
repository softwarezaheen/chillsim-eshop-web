import { api } from "./axios";

export const redeemVoucher = async (payload) => {
  try {
    const res = await api.post(`api/v1/voucher/redeem`, payload);
    return res;
  } catch (error) {
    throw error;
  }
};

export const getWalletTransactions = async (page = 1, pageSize = 10) => {
  try {
    const res = await api.get(`api/v1/wallet/transactions`, {
      params: { 
        page_index: page,
        page_size: pageSize 
      }
    });
    return res;
  } catch (error) {
    console.error("getWalletTransactions API error:", error);
    // If API endpoint doesn't exist yet, return empty data instead of throwing
    if (error?.response?.status === 404 || error?.code === 'ERR_NETWORK') {
      return {
        data: {
          success: true,
          data: [],
          total_count: 0,
          status_code: 200
        }
      };
    }
    throw error;
  }
};