import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

// ========================================
// 🛡️ CRITICAL FIX: Safe localStorage access for iOS in-app browsers
// ========================================
// This code runs on module load BEFORE any error handlers exist
// If localStorage is blocked (iOS FB/IG browsers), this would crash the entire app

const isStorageAvailable = () => {
  try {
    const testKey = "__i18n_test__";
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const storageAvailable = isStorageAvailable();

// Only set default language if localStorage is available
if (storageAvailable) {
  try {
    if (!localStorage.getItem("i18nextLng")) {
      localStorage.setItem(
        "i18nextLng",
        import.meta.env.VITE_DEFAULT_LANGUAGE || "en"
      );
    }
  } catch (error) {
    console.warn("⚠️ Could not set default i18n language in localStorage:", error);
  }
}

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: import.meta.env.VITE_DEFAULT_LANGUAGE || "en", // fallback only
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // If localStorage is blocked, fall back to navigator/htmlTag
      order: storageAvailable 
        ? ["localStorage", "navigator", "htmlTag", "path", "subdomain"]
        : ["navigator", "htmlTag", "path", "subdomain"],
      // Only cache to localStorage if available
      caches: storageAvailable ? ["localStorage"] : [],
      lookupLocalStorage: "i18nextLng",
    },
    supportedLngs: ["en", "ro", "es", "fr", "de", "hi"],
    backend: {
      loadPath: "/locales/{{lng}}/translation.json",
    },
    react: {
      // Disable Suspense for better iOS in-app browser compatibility
      useSuspense: false,
    },
  });

export default i18n;
