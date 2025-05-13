import { api } from "./axios";

export const getHomePageContent = async (payload) => {
  try {
    const res = await api.get("api/v1/home/");
    return res;
  } catch (error) {
    throw error;
  }
};

export const getBundlesByCountry = async (payload) => {
  try {
    const res = await api.get("api/v1/bundles/by-country", {
      params: { country_codes: payload },
    });
    return res;
  } catch (error) {
    throw error;
  }
};

export const getBundlesByRegion = async (payload) => {
  try {
    const res = await api.get(`api/v1/bundles/by-region/${payload}`, {});
    return res;
  } catch (error) {
    throw error;
  }
};

export const contactUs = async (payload) => {
  try {
    const res = await api.post("api/v1/app/contact", payload);
    return res;
  } catch (error) {
    return error;
  }
};

export const getAboutusContent = async () => {
  try {
    const res = await api.get("api/v1/app/about_us");
    return res;
  } catch (error) {
    return error;
  }
};

export const getTermsContent = async () => {
  try {
    const res = await api.get("api/v1/app/terms-and-conditions");
    return res;
  } catch (error) {
    return error;
  }
};

export const getPrivacyPolicyContent = async () => {
  try {
    const res = await api.get("api/v1/app/privacy_policy");
    return res;
  } catch (error) {
    return error;
  }
};

export const getFAQContent = async () => {
  try {
    const res = await api.get("api/v1/app/faq");
    return res;
  } catch (error) {
    return error;
  }
};
