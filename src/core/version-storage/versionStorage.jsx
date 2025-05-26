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
      localStorage.removeItem(API_CACHE_KEY);
      setStoredVersion(newVersion);
      return true;
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }
  return false;
};
