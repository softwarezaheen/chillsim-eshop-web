import { useEffect, useState, useRef } from "react";
import axios from "axios";

const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const VERSION_STORAGE_KEY = "app_build_version";

export const useVersionChecker = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [newVersion, setNewVersion] = useState(null);
  const intervalRef = useRef(null);
  const isCheckingRef = useRef(false);

  // Disable version checking in development/test environments
  // Only run in production/staging/qa or any non-dev environment
  const isDevelopment = ['dev', 'development', 'test', 'local'].includes(
    (import.meta.env.VITE_ENVIRONMENT || '').toLowerCase()
  );

  if (isDevelopment) {
    return {
      updateAvailable: false,
      newVersion: null,
      reloadApp: () => {},
      dismissUpdate: () => {},
    };
  }

  /**
   * Fetch the current build version from the server
   * Uses cache-busting to ensure fresh data
   */
  const checkVersion = async () => {
    // Prevent concurrent checks
    if (isCheckingRef.current) return;
    
    try {
      isCheckingRef.current = true;
      
      // Cache-busting query param
      const timestamp = Date.now();
      const response = await axios.get(`/version.json?t=${timestamp}`, {
        headers: { "Cache-Control": "no-cache" },
        timeout: 5000, // 5s timeout
      });

      const { version: serverVersion } = response.data;
      const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY);

      // First time visit - just store the version
      if (!storedVersion) {
        localStorage.setItem(VERSION_STORAGE_KEY, serverVersion);
        return;
      }

      // Version mismatch detected
      if (storedVersion !== serverVersion) {
        console.log(
          `🔄 New version detected: ${storedVersion} → ${serverVersion}`
        );
        setNewVersion(serverVersion);
        setUpdateAvailable(true);
      }
    } catch (error) {
      // Fail silently - don't disrupt user experience
      console.warn("Version check failed:", error.message);
    } finally {
      isCheckingRef.current = false;
    }
  };

  /**
   * Reload the application and update stored version
   */
  const reloadApp = () => {
    if (newVersion) {
      localStorage.setItem(VERSION_STORAGE_KEY, newVersion);
    }
    
    // Hard reload to bypass cache
    window.location.reload(true);
  };

  /**
   * Dismiss the update notification (user chooses to continue)
   */
  const dismissUpdate = () => {
    setUpdateAvailable(false);
  };

  useEffect(() => {
    // Initial check on mount
    checkVersion();

    // Set up periodic checks
    intervalRef.current = setInterval(checkVersion, VERSION_CHECK_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    updateAvailable,
    newVersion,
    reloadApp,
    dismissUpdate,
  };
};
