/**
 * Facebook Pixel Integration
 * Handles sending events to Facebook Pixel with proper formatting
 * 
 * IMPORTANT: Facebook Pixel is injected via Google Tag Manager
 * This module only sends events if fbq exists (user has accepted cookies)
 */

/**
 * Check if Facebook Pixel is available
 * @returns {boolean}
 */
export const isFacebookPixelAvailable = () => {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
};

/**
 * Send event to Facebook Pixel
 * @param {string} eventName - Facebook standard event name
 * @param {object} parameters - Event parameters
 * @param {object} options - Additional options (e.g., eventID for deduplication)
 */
const sendToFacebookPixel = (eventName, parameters = {}, options = {}) => {
  if (!isFacebookPixelAvailable()) {
    console.log(`🔵 Facebook Pixel not available - skipping ${eventName}`);
    return;
  }

  try {
    // Sanitize parameters for Facebook (convert complex objects to JSON strings if needed)
    const sanitizedParams = sanitizeFacebookParameters(parameters);
    
    console.log(`🔵 Facebook Pixel: ${eventName}`, sanitizedParams);
    
    // Send to Facebook Pixel
    window.fbq('track', eventName, sanitizedParams, options);
  } catch (error) {
    console.error(`Error sending Facebook Pixel event ${eventName}:`, error);
  }
};

/**
 * Sanitize parameters for Facebook Pixel
 * Facebook requires primitive types - convert arrays/objects to JSON strings
 * @param {object} params
 * @returns {object}
 */
const sanitizeFacebookParameters = (params) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(params)) {
    // Skip null/undefined
    if (value === null || value === undefined) {
      continue;
    }
    
    // Handle arrays (convert to JSON string)
    if (Array.isArray(value)) {
      sanitized[key] = JSON.stringify(value);
      continue;
    }
    
    // Handle objects (convert to JSON string)
    if (typeof value === 'object') {
      sanitized[key] = JSON.stringify(value);
      continue;
    }
    
    // Handle primitives (keep as-is)
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
      continue;
    }
    
    // Fallback: convert to string
    sanitized[key] = String(value);
  }
  
  return sanitized;
};

/**
 * Send Purchase event to Facebook
 * @param {object} params - Purchase parameters
 * @param {string} transactionId - Order ID for deduplication
 */
export const sendFacebookPurchase = (params, transactionId) => {
  sendToFacebookPixel('Purchase', params, {
    eventID: transactionId, // Deduplication with CAPI
  });
};

/**
 * Send AddToCart event to Facebook
 * @param {object} params - AddToCart parameters
 */
export const sendFacebookAddToCart = (params) => {
  sendToFacebookPixel('AddToCart', params);
};

/**
 * Send ViewContent event to Facebook
 * Used for both single item views and item lists
 * @param {object} params - ViewContent parameters
 */
export const sendFacebookViewContent = (params) => {
  sendToFacebookPixel('ViewContent', params);
};

/**
 * Send InitiateCheckout event to Facebook
 * @param {object} params - InitiateCheckout parameters
 */
export const sendFacebookInitiateCheckout = (params) => {
  sendToFacebookPixel('InitiateCheckout', params);
};

/**
 * Send custom event to Facebook
 * @param {string} eventName - Custom event name
 * @param {object} params - Event parameters
 */
export const sendFacebookCustomEvent = (eventName, params) => {
  if (!isFacebookPixelAvailable()) {
    console.log(`🔵 Facebook Pixel not available - skipping ${eventName}`);
    return;
  }

  try {
    const sanitizedParams = sanitizeFacebookParameters(params);
    console.log(`🔵 Facebook Pixel Custom: ${eventName}`, sanitizedParams);
    window.fbq('trackCustom', eventName, sanitizedParams);
  } catch (error) {
    console.error(`Error sending Facebook custom event ${eventName}:`, error);
  }
};
