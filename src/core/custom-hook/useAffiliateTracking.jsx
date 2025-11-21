import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackAffiliateVisit } from "../apis/affiliatesAPI";

// Attribution window: configurable via environment, defaults to 30 days
const ATTRIBUTION_WINDOW_DAYS = parseInt(import.meta.env.VITE_AFFILIATES_ATTRIBUTION_WINDOW_DAYS || "30", 10);
const ATTRIBUTION_WINDOW_MS = ATTRIBUTION_WINDOW_DAYS * 24 * 60 * 60 * 1000;

/**
 * Validate click identifier format (security: prevent XSS, injection)
 * @param {string} clickId - The click identifier to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateClickIdentifier = (clickId) => {
  if (!clickId || typeof clickId !== 'string') {
    return false;
  }
  
  // Must be 1-100 characters
  if (clickId.length < 1 || clickId.length > 100) {
    return false;
  }
  
  // Only alphanumeric, hyphens, and underscores allowed
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  return validPattern.test(clickId);
};

/**
 * Custom hook to handle affiliate tracking from URL parameters
 * Tracks the im_ref parameter and stores it in localStorage with 30-day expiry
 * 
 * Usage: Call this hook in App.jsx or main router component
 */
export const useAffiliateTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const imRef = searchParams.get("im_ref");

    if (imRef) {
      // Validate click identifier format (security check)
      if (!validateClickIdentifier(imRef)) {
        console.warn("⚠️ Invalid affiliate click identifier format, ignoring:", imRef.substring(0, 50));
        // Clean URL even if invalid
        searchParams.delete("im_ref");
        const newSearch = searchParams.toString();
        const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ""}${location.hash}`;
        window.history.replaceState({}, "", newUrl);
        return;
      }

      console.log("🔗 Affiliate click detected:", imRef);

      // Store in localStorage with 30-day attribution window
      // This overwrites any previous click (last-click attribution model)
      try {
        localStorage.setItem("affiliate_click_id", imRef);
        localStorage.setItem("affiliate_click_timestamp", Date.now().toString());
      } catch (error) {
        console.warn("⚠️ Could not store affiliate data in localStorage:", error);
      }

      // Track the visit via API (fire and forget - completely non-blocking)
      Promise.resolve().then(() => {
        trackAffiliateVisit(imRef)
          .then((response) => {
            if (response?.data) {
              console.log("✅ Affiliate visit tracked successfully");
            }
          })
          .catch(() => {
            // Silent failure - don't block page load or clutter console
          });
      });

      // Optional: Clean URL by removing the im_ref parameter
      // This prevents the parameter from appearing in browser history
      searchParams.delete("im_ref");
      const newSearch = searchParams.toString();
      const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ""}${location.hash}`;
      
      // Use replaceState to avoid adding to browser history
      window.history.replaceState({}, "", newUrl);
    }
  }, [location]);

  // Return affiliate data if needed elsewhere in the app
  // Validates 30-day expiry before returning
  const getAffiliateData = () => {
    try {
      const clickId = localStorage.getItem("affiliate_click_id");
      const timestamp = localStorage.getItem("affiliate_click_timestamp");
      
      if (!clickId || !timestamp) {
        return null;
      }

      const clickTimestamp = parseInt(timestamp);
      
      // Validate timestamp is a valid number
      if (isNaN(clickTimestamp)) {
        // Clean up malformed data
        localStorage.removeItem("affiliate_click_id");
        localStorage.removeItem("affiliate_click_timestamp");
        return null;
      }
      
      const now = Date.now();
      const isExpired = now - clickTimestamp > ATTRIBUTION_WINDOW_MS;

      if (isExpired) {
        // Clean up expired data
        localStorage.removeItem("affiliate_click_id");
        localStorage.removeItem("affiliate_click_timestamp");
        return null;
      }

      return { clickId, timestamp: clickTimestamp };
    } catch (error) {
      return null;
    }
  };

  return { getAffiliateData };
};
