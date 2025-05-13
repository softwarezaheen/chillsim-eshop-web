import { api } from "./axios";

export const getConfigurations = async () => {
  try {
    const res = await api.get(`api/v1/app/configurations`);
    return res;
  } catch (error) {
    return error;
  }
};

export const getActiveCurrencies = async () => {
  try {
    const res = await api.get(`api/v1/app/currency`);
    return res;
  } catch (error) {
    return error;
  }
};
