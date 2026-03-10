import { useEffect, useRef } from "react";
import { getBundlesVersion } from "../apis/bundlesAPI";
import { queryClient } from "../../main";

const VERSION_CHECK_INTERVAL = 15 * 60 * 1000; // 15 minutes
const BUNDLES_VERSION_STORAGE_KEY = "app_bundles_version";

export const useBundlesVersionChecker = () => {
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

      // Version mismatch - silently refresh the cache without interrupting the user
      if (storedVersion !== serverVersion) {
        console.log(`📦 New bundles version: ${storedVersion} → ${serverVersion}. Refreshing cache silently.`);

        // Clear all locale cache entries dynamically (no hardcoded language list)
        Object.keys(localStorage)
          .filter(k => k.startsWith('home_countries_cache_'))
          .forEach(k => localStorage.removeItem(k));
        localStorage.removeItem('react-query-cache');

        // Update stored version
        localStorage.setItem(BUNDLES_VERSION_STORAGE_KEY, serverVersion);

        // Invalidate in-memory React Query so home data refetches transparently
        queryClient.invalidateQueries({ queryKey: ["home-countries"] });
      }
    } catch (error) {
      console.warn("Bundles version check failed:", error.message);
    } finally {
      isCheckingRef.current = false;
    }
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
    updateAvailable: false,
    reloadApp: () => {},
    dismissUpdate: () => {},
  };
};
