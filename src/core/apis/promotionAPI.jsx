import { api } from "./axios";

export const validatePromotion = async (payload) => {
  try {
    const res = await api.post(`api/v1/promotion/validation`, payload);
    return res;
  } catch (error) {
    throw error;
  }
};