import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";

/**
 * Custom hook to manage welcome offer popup display logic
 * Shows a special offer to unauthenticated visitors after 30 seconds
 * 
 * Features:
 * - Only shows to unauthenticated users (not logged in, not tmp authenticated)
 * - 30-second cumulative timer across page navigation
 * - Minimizes to widget on dismiss (not hidden completely)
 * - Widget stays until user logs in
 * - localStorage persistence for state
 * 
 * @returns {Object} { 
 *   shouldShowPopup, 
 *   shouldShowWidget, 
 *   showPopupFromWidget, 
 *   minimizeToWidget, 
 *   closeWidget,
 *   showSuccessMessage,
 *   setShowSuccessMessage
 * }
 */
export const useWelcomeOffer = () => {
  const [shouldShowPopup, setShouldShowPopup] = useState(false);
  const [shouldShowWidget, setShouldShowWidget] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(false);

  const authState = useSelector((state) => state.authentication);
  
  // Check if user is authenticated (either full or temporary)
  const isAuthenticated = authState?.isAuthenticated || authState?.tmp?.isAuthenticated;

  const STORAGE_KEY = "welcome_offer_state";
  const TIME_KEY = "welcome_offer_time_spent";
  const TRIGGER_SECONDS = 30;

  // Get stored state
  const getStoredState = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (error) {
      console.error("Error reading welcome offer state:", error);
      return null;
    }
  }, []);

  // Get accumulated time spent
  const getAccumulatedTime = useCallback(() => {
    try {
      const stored = localStorage.getItem(TIME_KEY);
      if (!stored) return 0;
      return parseInt(stored, 10) || 0;
    } catch (error) {
      return 0;
    }
  }, []);

  // Save accumulated time
  const saveAccumulatedTime = useCallback((time) => {
    try {
      localStorage.setItem(TIME_KEY, time.toString());
    } catch (error) {
      console.error("Error saving welcome offer time:", error);
    }
  }, []);

  // Save state
  const saveState = useCallback((state) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...state,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error("Error saving welcome offer state:", error);
    }
  }, []);

  // Clear state on login
  useEffect(() => {
    if (isAuthenticated) {
      // User logged in - hide everything and clear state
      setShouldShowPopup(false);
      setShouldShowWidget(false);
      setShowSuccessMessage(false);
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TIME_KEY);
      } catch (error) {
        console.error("Error clearing welcome offer state:", error);
      }
    }
  }, [isAuthenticated]);

  // Check if should show based on stored state (only for unauthenticated users)
  useEffect(() => {
    if (isAuthenticated) return;

    const stored = getStoredState();
    
    if (stored) {
      // If widget was explicitly closed, don't show anything
      if (stored.widgetClosed) {
        return;
      }
      // If previously minimized, show widget
      if (stored.minimized) {
        setShouldShowWidget(true);
        return;
      }
    }
  }, [isAuthenticated, getStoredState]);

  // Cumulative time tracker
  useEffect(() => {
    if (isAuthenticated) return;
    if (timeElapsed) return; // Already triggered

    const stored = getStoredState();
    if (stored?.widgetClosed || stored?.minimized) return; // Don't track if already handled

    let accumulatedTime = 0; // Start fresh on each app reload
    
    const interval = setInterval(() => {
      accumulatedTime += 1;

      if (accumulatedTime >= TRIGGER_SECONDS) {
        setTimeElapsed(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated, timeElapsed, getStoredState]);

  // Show popup when time threshold reached
  useEffect(() => {
    if (isAuthenticated) return;
    if (!timeElapsed) return;

    const stored = getStoredState();
    // Don't show if already minimized or closed
    if (stored?.widgetClosed || stored?.minimized) return;

    setShouldShowPopup(true);
  }, [isAuthenticated, timeElapsed, getStoredState]);

  // Action handlers
  const minimizeToWidget = useCallback(() => {
    setShouldShowPopup(false);
    setShowSuccessMessage(false);
    setShouldShowWidget(true);
    saveState({ minimized: true });
  }, [saveState]);

  const showPopupFromWidget = useCallback(() => {
    setShouldShowWidget(false);
    setShouldShowPopup(true);
  }, []);

  const closeWidget = useCallback(() => {
    setShouldShowWidget(false);
    setShouldShowPopup(false);
    setShowSuccessMessage(false);
    saveState({ widgetClosed: true });
  }, [saveState]);

  return {
    showModal: shouldShowPopup,
    showWidget: shouldShowWidget,
    showSuccess: showSuccessMessage,
    handleDismiss: minimizeToWidget,
    handleGetOffer: () => setShowSuccessMessage(true),
    handleWidgetClick: showPopupFromWidget,
    handleWidgetClose: closeWidget
  };
};
