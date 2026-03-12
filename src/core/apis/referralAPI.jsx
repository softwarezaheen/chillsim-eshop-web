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

/**
 * Get current user's referral milestone progress
 * @returns {Promise} API response with progress data:
 *   total_referrals, current_cycle, position_in_cycle, cycle_size,
 *   milestones [{type, target, bonus, reached}],
 *   total_earned, referral_amount, referred_discount_percentage
 */
export const getReferralProgress = async () => {
  try {
    const res = await api.get(`api/v1/promotion/referral-progress`);
    return res;
  } catch (error) {
    throw error;
  }
};

/**
 * Get total cashback earned from orders (loyalty cashback only)
 * @returns {Promise} API response with { total_cashback: number }
 */
export const getCashbackTotal = async () => {
  try {
    const res = await api.get(`api/v1/promotion/cashback-total`);
    return res;
  } catch (error) {
    throw error;
  }
};
