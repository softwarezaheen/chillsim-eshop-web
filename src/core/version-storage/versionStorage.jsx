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
      
      // Clear language-specific cache keys
      const languages = ['en', 'ro', 'es', 'fr'];
      languages.forEach(lang => {
        localStorage.removeItem(`home_countries_cache_${lang}`);
      });
      
      setStoredVersion(newVersion);
      return true;
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }
  return false;
};
