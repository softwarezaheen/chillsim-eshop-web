import { api } from "./axios";

export const addDevice = async (payload) => {
  try {
    const res = await api.post("api/v1/app/device", { ...payload });
    return res;
  } catch (error) {
    return error;
  }
};
