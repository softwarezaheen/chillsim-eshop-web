import { api } from "./axios";

export const getBundleById = async (payload) => {
  try {
    const res = await api.get(`api/v1/bundles/${payload}`);
    return res;
  } catch (error) {
    return error;
  }
};
