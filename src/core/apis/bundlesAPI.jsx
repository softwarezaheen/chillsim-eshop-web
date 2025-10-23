import { api } from "./axios";

export const getBundleById = async (payload) => {
  try {
    const res = await api.get(`api/v1/bundles/${payload}`);
    return res;
  } catch (error) {
    return error;
  }
};

export const getBundlesVersion = async () => {
  try {
    const res = await api.get("api/v1/bundles/version", {
      headers: { "Cache-Control": "no-cache" },
    });
    return res;
  } catch (error) {
    throw error;
  }
};
