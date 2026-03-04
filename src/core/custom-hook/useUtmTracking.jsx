import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Attribution window: configurable via environment, defaults to 30 days
const ATTRIBUTION_WINDOW_DAYS = parseInt(
  import.meta.env.VITE_UTM_ATTRIBUTION_WINDOW_DAYS || "30",
  10
);
const ATTRIBUTION_WINDOW_MS = ATTRIBUTION_WINDOW_DAYS * 24 * 60 * 60 * 1000;

const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign"];
const STORAGE_KEY = "utm_data";

/**
 * Sanitize a UTM value: allow alphanumeric, hyphens, underscores, dots, spaces (max 200 chars)
 * @param {string} value
 * @returns {string|null} sanitized value or null if invalid
 */
const sanitizeUtmValue = (value) => {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim().substring(0, 200);
  if (trimmed.length === 0) return null;
  // Allow common UTM characters: alphanumeric, hyphens, underscores, dots, spaces, plus, percent-encoded
  const validPattern = /^[a-zA-Z0-9_\-.\s+%]+$/;
  return validPattern.test(trimmed) ? trimmed : null;
};

/**
 * Custom hook to capture UTM parameters from URL and store in localStorage.
 *
 * Uses FIRST-TOUCH attribution: only stores UTMs if none exist yet (doesn't overwrite).
 * Stored data expires after 30 days (configurable via VITE_UTM_ATTRIBUTION_WINDOW_DAYS).
 *
 * UTM params are NOT removed from the URL (unlike affiliate tracking) because:
 * - They don't contain sensitive data
 * - Marketing/analytics tools may also need them in the URL
 *
 * Usage: Call this hook in App.jsx alongside useAffiliateTracking()
 */
export const useUtmTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    // Check if any UTM param is present in the URL
    const utmValues = {};
    let hasAnyUtm = false;
    for (const param of UTM_PARAMS) {
      const raw = searchParams.get(param);
      const sanitized = sanitizeUtmValue(raw);
      if (sanitized) {
        utmValues[param] = sanitized;
        hasAnyUtm = true;
      }
    }

    if (!hasAnyUtm) return;

    // First-touch: only store if no existing (non-expired) UTM data
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (existing) {
        const parsed = JSON.parse(existing);
        const ts = parseInt(parsed?.timestamp);
        if (!isNaN(ts) && Date.now() - ts < ATTRIBUTION_WINDOW_MS) {
          // Existing UTM data is still valid — keep it (first-touch)
          return;
        }
      }
    } catch {
      // Malformed data — overwrite
    }

    // Store UTM data with timestamp
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...utmValues,
          timestamp: Date.now().toString(),
        })
      );
      console.log("📊 UTM parameters captured:", utmValues);
    } catch (error) {
      console.warn("⚠️ Could not store UTM data in localStorage:", error);
    }
  }, [location]);

  /**
   * Get currently stored UTM data (validates expiry before returning).
   * @returns {{ utm_source?: string, utm_medium?: string, utm_campaign?: string } | null}
   */
  const getUtmData = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      const ts = parseInt(parsed?.timestamp);

      if (isNaN(ts)) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      if (Date.now() - ts > ATTRIBUTION_WINDOW_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      // Return only the UTM fields (strip timestamp)
      const result = {};
      for (const param of UTM_PARAMS) {
        if (parsed[param]) result[param] = parsed[param];
      }
      return Object.keys(result).length > 0 ? result : null;
    } catch {
      return null;
    }
  };

  return { getUtmData };
};
