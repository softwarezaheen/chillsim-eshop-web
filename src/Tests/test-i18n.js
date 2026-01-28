import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Minimal test translations for components
const resources = {
  en: {
    translation: {
      appBanner: {
        title: "Open in ChillSim App",
        subtitle: "Even better experience in our app",
        openButton: "OPEN",
        dismissButton: "Dismiss banner",
      },
      update: {
        updateAvailable: "Update Available",
        newVersionMessage: "A new version of the app is available. Please refresh to get the latest features.",
        refresh: "Refresh",
        dismiss: "Dismiss",
      },
    },
  },
};

// Create a separate i18n instance for tests
const testI18n = i18n.createInstance();

testI18n
  .use(initReactI18next)
  .init({
    lng: "en",
    fallbackLng: "en",
    debug: false,
    resources,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default testI18n;
