import { useEffect, useState, useRef } from "react";
import { getBundlesVersion } from "../apis/bundlesAPI";
import { queryClient } from "../../main";

const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const BUNDLES_VERSION_STORAGE_KEY = "app_bundles_version";

export const useBundlesVersionChecker = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [newVersion, setNewVersion] = useState(null);
  const intervalRef = useRef(null);
  const isCheckingRef = useRef(false);

  // Disable in development
  const isDevelopment = ['dev', 'development', 'test', 'local'].includes(
    (import.meta.env.VITE_ENVIRONMENT || '').toLowerCase()
  );

  if (isDevelopment) {
    return {
      updateAvailable: false,
      reloadApp: () => {},
      dismissUpdate: () => {},
    };
  }

  const checkVersion = async () => {
    if (isCheckingRef.current) return;
    
    // Skip check if we just reloaded (clear the flag after skipping)
    if (sessionStorage.getItem('bundles_just_reloaded') === 'true') {
      console.log('📦 Skipping version check - just reloaded');
      sessionStorage.removeItem('bundles_just_reloaded');
      return;
    }
    
    try {
      isCheckingRef.current = true;
      
      const response = await getBundlesVersion();
      const serverVersion = response?.data?.data?.version || response?.data?.version;
      
      if (!serverVersion) {
        console.warn("Bundles version check: No version returned");
        return;
      }
      
      const storedVersion = localStorage.getItem(BUNDLES_VERSION_STORAGE_KEY);

      // First time - just store it
      if (!storedVersion) {
        localStorage.setItem(BUNDLES_VERSION_STORAGE_KEY, serverVersion);
        console.log(`📦 Bundles version initialized: ${serverVersion}`);
        return;
      }

      // Version mismatch - bundles updated
      if (storedVersion !== serverVersion) {
        console.log(`📦 New bundles version: ${storedVersion} → ${serverVersion}`);
        setNewVersion(serverVersion);
        setUpdateAvailable(true);
      }
    } catch (error) {
      console.warn("Bundles version check failed:", error.message);
    } finally {
      isCheckingRef.current = false;
    }
  };

  const reloadApp = () => {
    if (!newVersion) return;
    
    // Set a flag to indicate we just reloaded (prevent immediate re-check)
    sessionStorage.setItem('bundles_just_reloaded', 'true');
    
    // Clear all bundle-related caches
    const languages = ['en', 'ro', 'es', 'fr'];
    languages.forEach(lang => {
      localStorage.removeItem(`home_countries_cache_${lang}`);
    });
    
    // Clear React Query persisted cache
    localStorage.removeItem('react-query-cache');
    
    // Invalidate React Query in-memory cache
    queryClient.removeQueries({ queryKey: ["home-countries"] });
    
    // Update version in localStorage
    localStorage.setItem(BUNDLES_VERSION_STORAGE_KEY, newVersion);
    
    // Reload page
    window.location.reload(true);
  };

  const dismissUpdate = () => {
    setUpdateAvailable(false);
  };

  useEffect(() => {
    // Initial check on mount
    checkVersion();

    // Set up periodic checks
    intervalRef.current = setInterval(checkVersion, VERSION_CHECK_INTERVAL);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    updateAvailable,
    reloadApp,
    dismissUpdate,
  };
};
