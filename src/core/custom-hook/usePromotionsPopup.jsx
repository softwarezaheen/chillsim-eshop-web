import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook to manage promotions popup display logic
 * Handles timing, scroll depth, and local storage persistence
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether the popup is enabled (usually tied to user auth + should_notify state)
 * @param {number} options.delaySeconds - Seconds to wait before showing popup (default: 30)
 * @param {number} options.scrollThreshold - Scroll percentage threshold (default: null for smart detection)
 * @param {boolean} options.useScrollTrigger - Whether to use scroll trigger at all (default: true)
 * @param {number} options.minTimeSeconds - Minimum time before ANY trigger can activate (default: 15)
 * @returns {Object} { shouldShow, dismissPopup, remindLater, dontShowAgain }
 */
export const usePromotionsPopup = ({
  enabled = true,
  delaySeconds = 30,
  scrollThreshold = null,
  useScrollTrigger = true,
  minTimeSeconds = 15,
} = {}) => {
  const [shouldShow, setShouldShow] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(false);
  const [minTimeReached, setMinTimeReached] = useState(false);
  const [scrollReached, setScrollReached] = useState(false);

  // SHARED storage key across all pages
  const SHARED_STORAGE_KEY = "promotions_popup_global";

  // Check if popup should be shown based on SHARED storage
  const checkShowCondition = useCallback(() => {
    if (!enabled) return false;

    try {
      const stored = localStorage.getItem(SHARED_STORAGE_KEY);
      if (!stored) return true;

      const data = JSON.parse(stored);
      const now = Date.now();
      const daysSince = (now - data.timestamp) / (1000 * 60 * 60 * 24);

      // Check dismissal rules
      if (data.action === "dismiss" && daysSince < 14) return false;
      if (data.action === "remind" && daysSince < 7) return false;
      if (data.action === "never" && daysSince < 90) return false;

      return true;
    } catch (error) {
      console.error("Error checking promotions popup condition:", error);
      return true;
    }
  }, [enabled]);

  // Minimum time gate - ALWAYS required before ANY trigger
  useEffect(() => {
    if (!enabled || !checkShowCondition()) return;

    const minTimer = setTimeout(() => {
      setMinTimeReached(true);
    }, minTimeSeconds * 1000);

    return () => clearTimeout(minTimer);
  }, [enabled, minTimeSeconds, checkShowCondition]);

  // Time-based trigger (main delay)
  useEffect(() => {
    if (!enabled || !checkShowCondition()) return;

    const timer = setTimeout(() => {
      setTimeElapsed(true);
    }, delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [enabled, delaySeconds, checkShowCondition]);

  // Smart scroll-based trigger with height detection
  useEffect(() => {
    if (!enabled || !checkShowCondition() || !useScrollTrigger) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = (scrollTop / scrollHeight) * 100;

      // Smart detection based on page height
      let threshold = scrollThreshold;
      if (!threshold) {
        const pageHeight = document.documentElement.scrollHeight;
        if (pageHeight < 2000) {
          threshold = 80; // Short pages: 80%
        } else if (pageHeight < 4000) {
          threshold = 70; // Medium pages: 70%
        } else {
          threshold = 60; // Long pages: 60%
        }
      }

      if (scrollPercent >= threshold) {
        setScrollReached(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Check initial scroll position
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [enabled, scrollThreshold, useScrollTrigger, checkShowCondition]);

  // Determine if popup should show
  useEffect(() => {
    if (!enabled || !checkShowCondition() || !minTimeReached) return;

    // If scroll trigger disabled, only use time
    if (!useScrollTrigger) {
      if (timeElapsed) {
        setShouldShow(true);
      }
    } else {
      // Use time OR scroll (whichever comes first, after min time)
      if (timeElapsed || scrollReached) {
        setShouldShow(true);
      }
    }
  }, [enabled, timeElapsed, scrollReached, minTimeReached, useScrollTrigger, checkShowCondition]);

  // Action handlers - save to SHARED storage
  const saveAction = useCallback(
    (action) => {
      try {
        const data = {
          action,
          timestamp: Date.now(),
        };
        localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(data));
        setShouldShow(false);
      } catch (error) {
        console.error("Error saving promotions popup action:", error);
      }
    },
    []
  );

  const dismissPopup = useCallback(() => {
    saveAction("dismiss");
  }, [saveAction]);

  const remindLater = useCallback(() => {
    saveAction("remind");
  }, [saveAction]);

  const dontShowAgain = useCallback(() => {
    saveAction("never");
  }, [saveAction]);

  const closePopup = useCallback(() => {
    setShouldShow(false);
  }, []);

  return {
    shouldShow,
    dismissPopup,
    remindLater,
    dontShowAgain,
    closePopup,
  };
};
