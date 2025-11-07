/**
 * Authentication Helper Utilities
 * Centralized functions to check authentication status across different auth types
 */

/**
 * Check if user is authenticated (either full auth or tmp auth)
 * @param {Object} authState - Redux authentication state
 * @returns {boolean} - True if user is authenticated in any way
 */
export const isUserAuthenticated = (authState) => {
  return authState?.isAuthenticated || authState?.tmp?.isAuthenticated || false;
};

/**
 * Get user's notification preference status
 * @param {Object} authState - Redux authentication state
 * @returns {boolean} - True if user has notifications enabled
 */
export const getUserNotificationStatus = (authState) => {
  return authState?.user_info?.should_notify || false;
};

/**
 * Check if promotions popup should be enabled for user
 * (authenticated but notifications disabled)
 * @param {Object} authState - Redux authentication state
 * @returns {boolean} - True if popup should be enabled
 */
export const shouldShowPromotionsPopup = (authState) => {
  const isAuth = isUserAuthenticated(authState);
  const hasNotifications = getUserNotificationStatus(authState);
  return isAuth && !hasNotifications;
};

/**
 * Get the active authentication type
 * @param {Object} authState - Redux authentication state
 * @returns {string} - 'main' | 'tmp' | 'none'
 */
export const getAuthType = (authState) => {
  if (authState?.isAuthenticated) return 'main';
  if (authState?.tmp?.isAuthenticated) return 'tmp';
  return 'none';
};
