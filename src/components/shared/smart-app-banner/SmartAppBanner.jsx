import React, { useEffect, useState } from "react";
import { Box, Button, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { gtmEvent } from "../../../core/utils/gtm";

/**
 * SmartAppBanner Component
 * 
 * Displays a banner prompting users to open the ChillSim mobile app
 * when accessing the website from in-app browsers (Instagram, Facebook, TikTok, etc.)
 * 
 * Features:
 * - Auto-detects in-app browsers
 * - Session-based dismissal
 * - Deep linking with URL context
 * - Analytics tracking
 * - Responsive design following ChillSim patterns
 */
const SmartAppBanner = () => {
  const { t } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 🚧 DEV MODE: Set to true to always show banner for testing
    const DEV_MODE_FORCE_SHOW = false; // Set to false for production
    
    // Detect in-app browsers (Instagram, Facebook, Twitter, TikTok, Snapchat, LinkedIn)
    const userAgent = navigator.userAgent || navigator.vendor || window.opera || "";
    const isInAppBrowser = /Instagram|FBAN|FBAV|Twitter|TikTok|Snapchat|LinkedIn|Pinterest/i.test(userAgent);
    
    // Check if already dismissed in this session
    const isDismissed = sessionStorage.getItem("chillsim_app_banner_dismissed");
    
    // Check if running on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // Show banner if: (in dev mode) OR (in-app browser on mobile and not dismissed)
    if ((DEV_MODE_FORCE_SHOW && !isDismissed) || (isInAppBrowser && isMobile && !isDismissed)) {
      setShowBanner(true);
      
      // Track banner impression
      gtmEvent("smart_banner_impression", {
        event_category: "engagement",
        event_label: "app_banner_shown",
        user_agent: userAgent,
        dev_mode: DEV_MODE_FORCE_SHOW,
      });
    }

    // Cleanup function
    return () => {
      // Component cleanup if needed
    };
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("chillsim_app_banner_dismissed", "true");
    
    // Track dismissal
    gtmEvent("smart_banner_dismiss", {
      event_category: "engagement",
      event_label: "app_banner_dismissed",
    });
  };

  const handleOpenApp = () => {
    // Detect platform
    const userAgent = navigator.userAgent;
    const isAndroid = /Android/i.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isMobile = isAndroid || isIOS;
    
    // Try to open the app with current URL context
    const currentUrl = encodeURIComponent(window.location.href);
    const customSchemeUrl = `chillsim://open?source=web&url=${currentUrl}`;
    
    // Track app open attempt
    gtmEvent("smart_banner_click", {
      event_category: "engagement",
      event_label: "app_banner_open_clicked",
      value: 1,
      url: window.location.href,
      platform: isAndroid ? "android" : isIOS ? "ios" : "desktop",
    });
    
    // Only attempt deep link on mobile devices
    if (isMobile) {
      // Attempt to open the app
      window.location.href = customSchemeUrl;
      
      // Fallback: If app doesn't open within 2.5 seconds, redirect to app store
      // This handles the case where the app is not installed
      const fallbackTimer = setTimeout(() => {
        if (isAndroid) {
          // Redirect to Google Play Store
          window.location.href = "https://play.google.com/store/apps/details?id=zaheen.esim.chillsim";
          
          // Track app store redirect
          gtmEvent("smart_banner_app_store_redirect", {
            event_category: "engagement",
            event_label: "redirected_to_play_store",
            platform: "android",
          });
        } else if (isIOS) {
          // Redirect to Apple App Store
          window.location.href = "https://apps.apple.com/us/app/chillsim-travel-esim/id6747967151";
          
          // Track app store redirect
          gtmEvent("smart_banner_app_store_redirect", {
            event_category: "engagement",
            event_label: "redirected_to_app_store",
            platform: "ios",
          });
        }
      }, 2500);
      
      // Clear the fallback timer if the page is hidden (app opened successfully)
      const handleVisibilityChange = () => {
        if (document.hidden) {
          clearTimeout(fallbackTimer);
        }
      };
      
      document.addEventListener("visibilitychange", handleVisibilityChange, { once: true });
    } else {
      // Desktop: Just show a console message for testing
      console.log("🚀 SmartAppBanner: Would open app with URL:", customSchemeUrl);
      console.log("💡 On mobile, this would try to open the app or redirect to app store");
      alert("📱 This banner is designed for mobile devices.\n\nOn mobile it would:\n1. Try to open the ChillSim app\n2. If not installed, redirect to App Store/Play Store");
    }
  };

  if (!showBanner) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: "linear-gradient(135deg, #906BAE 0%, #D3DC47 100%)",
        color: "white",
        px: 2,
        py: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
        zIndex: 9999,
        animation: "slideDown 0.3s ease-out",
        "@keyframes slideDown": {
          from: {
            transform: "translateY(-100%)",
            opacity: 0,
          },
          to: {
            transform: "translateY(0)",
            opacity: 1,
          },
        },
      }}
    >
      {/* App Icon + Text */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* App Icon */}
        <Box
          sx={{
            width: { xs: 36, sm: 40 },
            height: { xs: 36, sm: 40 },
            background: "white",
            borderRadius: 1,
            mr: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Box
            component="img"
            src="/logo/logo2.png"
            alt="ChillSim"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: 1,
            }}
            onError={(e) => {
              // Fallback to emoji if logo fails to load
              const parent = e.target.parentElement;
              e.target.style.display = "none";
              if (parent) {
                parent.textContent = "📱";
                parent.style.fontSize = "24px";
              }
            }}
          />
        </Box>

        {/* Text Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              fontWeight: 600,
              fontSize: { xs: "0.8125rem", sm: "0.875rem" },
              lineHeight: 1.2,
              mb: 0.25,
            }}
          >
            {t("appBanner.title")}
          </Box>
          <Box
            sx={{
              fontSize: { xs: "0.6875rem", sm: "0.75rem" },
              opacity: 0.9,
              lineHeight: 1.2,
            }}
          >
            {t("appBanner.subtitle")}
          </Box>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          flexShrink: 0,
        }}
      >
        {/* Open Button */}
        <Button
          variant="contained"
          size="small"
          onClick={handleOpenApp}
          aria-label={t("appBanner.openButton")}
          sx={{
            backgroundColor: "white",
            color: "#906BAE",
            fontWeight: 600,
            textTransform: "uppercase",
            fontSize: { xs: "0.6875rem", sm: "0.75rem" },
            px: { xs: 1.5, sm: 2 },
            py: 0.5,
            borderRadius: 3,
            minWidth: "auto",
            whiteSpace: "nowrap",
            "&:hover": {
              backgroundColor: "#f5f5f5",
              transform: "scale(1.05)",
            },
            "&:active": {
              transform: "scale(0.95)",
            },
            transition: "all 0.2s ease",
          }}
        >
          {t("appBanner.openButton")}
        </Button>

        {/* Close Button */}
        <IconButton
          size="small"
          onClick={handleDismiss}
          aria-label={t("appBanner.dismissButton")}
          sx={{
            color: "white",
            opacity: 0.7,
            p: 0.5,
            "&:hover": {
              opacity: 1,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default SmartAppBanner;
