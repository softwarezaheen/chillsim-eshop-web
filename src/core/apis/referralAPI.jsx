import { api } from "./axios";

/**
 * Get referral information by referral code
 * Used when a visitor lands on /referral?referralCode=XXX
 * @param {string} referralCode - The referral code from the URL
 * @returns {Promise} API response with referrer information
 *   - percentage: Discount percentage for referred user
 *   - referred_by: Name of the referrer
 *   - currency: Currency for display
 *   - message: Optional message
 */
export const getReferralInfo = async (referralCode) => {
  try {
    const res = await api.get(`api/v1/promotion/referral-info`, {
      params: { referralCode: referralCode },
    });
    return res;
  } catch (error) {
    throw error;
  }
};

/**
 * Get current user's referral statistics and details
 * @returns {Promise} API response with user's referral stats
 */
export const getMyReferralStats = async () => {
  try {
    const res = await api.get(`api/v1/user/referral-stats`);
    return res;
  } catch (error) {
    throw error;
  }
};

/**
 * Get promotion usage history (referral rewards, discounts, cashback)
 * Supports pagination for infinite scroll
 * @param {Object} payload - Pagination parameters (page_index, page_size)
 * @returns {Promise} API response with usage history
 */
export const getPromotionUsageHistory = async (payload) => {
  try {
    const res = await api.get(`api/v1/promotion/usage-history`, {
      params: { ...payload },
    });
    return res;
  } catch (error) {
    throw error;
  }
};
