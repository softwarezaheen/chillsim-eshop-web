//UTILITIES
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { useTranslation } from "react-i18next";
//COMPONENT
import PushNotification from "./components/push-notification/PushNotification";
import UpdateBanner from "./components/shared/update-banner/UpdateBanner";
import SmartAppBanner from "./components/shared/smart-app-banner/SmartAppBanner";
import AppRouter from "./core/routes/AppRouter";
import { WelcomeOfferModal, WelcomeOfferWidget } from "./components/welcome-offer/WelcomeOfferModal";
import { useWelcomeOffer } from "./core/custom-hook/useWelcomeOffer";
import { fetchUserInfo, SignOut } from "./redux/reducers/authReducer";
import { fetchCurrencyInfo } from "./redux/reducers/currencyReducer";
import { loadReferralFromStorage } from "./redux/reducers/referralReducer";
import { setDayjsLocale } from "./components/dayjsSetup.js";
import { supportWhatsappPhone } from "./core/variables/ProjectVariables";
import { useAffiliateTracking } from "./core/custom-hook/useAffiliateTracking";

// iOS in-app browser detection
const isIOSInAppBrowser = () => {
  const ua = navigator.userAgent || '';
  return /iPhone|iPad|iPod/.test(ua) && /FBAN|FBAV|Instagram|Twitter|Line|KAKAOTALK/i.test(ua);
};

function App() {
  const dispatch = useDispatch();
  const whatsapp_number = useSelector(
    (state) => state.currency?.whatsapp_number || supportWhatsappPhone,
  );
  
  const { i18n } = useTranslation();
  
  // Track affiliate visits from URL parameters
  useAffiliateTracking();
  
  // Welcome offer popup for new visitors
  const welcomeOffer = useWelcomeOffer();

  const getDeviceId = async () => {
    try {
      // Skip FingerprintJS entirely on iOS in-app browsers
      if (isIOSInAppBrowser()) {
        console.log("🍎 iOS in-app browser detected - skipping FingerprintJS");
        const fallbackId = `ios-inapp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        try {
          sessionStorage.setItem("x-device-id", fallbackId);
        } catch (storageError) {
          console.warn("⚠️ sessionStorage blocked, device ID not persisted:", storageError);
        }
        return;
      }

      const fp = await FingerprintJS.load();
      const result = await fp.get();
      console.log(result, "fingerprint result");
      try {
        sessionStorage.setItem("x-device-id", result?.visitorId);
      } catch (storageError) {
        console.warn("⚠️ sessionStorage blocked, device ID not persisted:", storageError);
      }
    } catch (error) {
      console.error("❌ FingerprintJS failed:", error);
      // Fallback: Generate a simple random ID
      const fallbackId = `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      try {
        sessionStorage.setItem("x-device-id", fallbackId);
        console.log("✅ Using fallback device ID:", fallbackId);
      } catch (storageError) {
        console.warn("⚠️ sessionStorage blocked, device ID not persisted:", storageError);
      }
    }
  };

  useEffect(() => {
    setDayjsLocale(i18n.language); // set locale whenever the language changes
  }, [i18n.language]);

  useEffect(() => {
    const lang = i18n.language;
    document.documentElement.lang = lang;
    document.documentElement.dir = "ltr";
  }, []);

  useEffect(() => {
    // Safely check sessionStorage
    let hasDeviceId = false;
    try {
      hasDeviceId = !!sessionStorage.getItem("x-device-id");
    } catch (error) {
      console.warn("⚠️ sessionStorage blocked, will generate device ID anyway:", error);
    }
    
    if (!hasDeviceId) {
      getDeviceId();
    }
    dispatch(fetchCurrencyInfo());
    
    // Load referral info from localStorage on app mount
    dispatch(loadReferralFromStorage());

    document.documentElement.dir = "ltr";
  }, [i18n.language, dispatch]);


  return (
    <div className="min-h-screen flex flex-col">
      <SmartAppBanner />
      <AppRouter />
      <PushNotification />
      <UpdateBanner />
      {/* Welcome Offer for new visitors */}
      <WelcomeOfferModal
        open={welcomeOffer.showModal}
        onClose={welcomeOffer.handleDismiss}
        onGetOffer={welcomeOffer.handleGetOffer}
        showSuccessMessage={welcomeOffer.showSuccess}
      />
      <WelcomeOfferWidget
        visible={welcomeOffer.showWidget}
        onClick={welcomeOffer.handleWidgetClick}
        onClose={welcomeOffer.handleWidgetClose}
      />
      {whatsapp_number?.trim() !== "" && (
        <a
          href={`https://wa.me/${whatsapp_number.replace(/[^+\d]/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-12 right-8 bg-success text-white p-4 rounded shadow-lg hover:bg-[#128C7E] transition-colors z-50"
        >
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      )}
    </div>
  );
}

export default App;
