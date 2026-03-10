export const VERSION_STORAGE_KEY = "app_bundles_version";
export const API_CACHE_KEY = "home_countries_cache";

export const getStoredVersion = () => {
  try {
    return localStorage.getItem(VERSION_STORAGE_KEY);
  } catch (error) {
    console.error("Error reading version from localStorage:", error);
    return null;
  }
};

export const setStoredVersion = (version) => {
  try {
    localStorage.setItem(VERSION_STORAGE_KEY, version);
  } catch (error) {
    console.error("Error saving version to localStorage:", error);
  }
};

export const clearCacheIfVersionChanged = (newVersion) => {
  const storedVersion = getStoredVersion();

  if (storedVersion !== newVersion) {
    try {
      // Clear old cache key (legacy)
      localStorage.removeItem(API_CACHE_KEY);
      
      // Clear all locale cache entries dynamically (no hardcoded language list)
      Object.keys(localStorage)
        .filter(k => k.startsWith('home_countries_cache_'))
        .forEach(k => localStorage.removeItem(k));
      
      setStoredVersion(newVersion);
      return true;
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }
  return false;
};
