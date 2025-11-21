import { api } from "./axios";

/**
 * Track affiliate visit when user lands with im_ref parameter
 * @param {string} clickIdentifier - The affiliate click identifier (im_ref parameter)
 * @returns {Promise} API response
 */
export const trackAffiliateVisit = async (clickIdentifier) => {
  try {
    const res = await api.post(`api/v1/affiliates/track`, {
      identifier: clickIdentifier,
    });
    return res;
  } catch (error) {
    console.error("❌ Failed to track affiliate visit:", error);
    // Don't throw - affiliates tracking should not break user experience
    return null;
  }
};
