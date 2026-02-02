import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  IconButton,
  Button,
  Box,
} from "@mui/material";
import { Close, CardGiftcard, ContentCopy, Check } from "@mui/icons-material";
import { toast } from "react-toastify";

/**
 * Welcome Offer Modal for new visitors
 * Shows a €0.50 offer for 1GB EU eSIM with promo code WELCOME
 * 
 * Two states:
 * 1. Initial offer - Shows the deal with "Get the offer!" CTA
 * 2. Success message - Shows promo code and signup button
 */
export const WelcomeOfferModal = ({ 
  open, 
  onClose, 
  showSuccessMessage, 
  onGetOffer 
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);

  const PROMO_CODE = "WELCOME";

  const handleGetOffer = () => {
    if (onGetOffer) {
      onGetOffer();
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      setCopied(true);
      toast.success(t("welcomeOffer.codeCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = PROMO_CODE;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success(t("welcomeOffer.codeCopied"));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSignUp = () => {
    if (onClose) onClose();
    navigate("/signin");
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: { xs: '95vh', sm: '90vh' },
          margin: { xs: 1, sm: 2, md: 3 },
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
    >
      <DialogContent className="flex flex-col gap-4 !p-0 relative">
        {/* Close Button */}
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "text.secondary",
            zIndex: 10,
            backgroundColor: "rgba(255,255,255,0.8)",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.95)",
            }
          }}
        >
          <Close fontSize="small" />
        </IconButton>

        {/* Gradient Header */}
        <Box 
          sx={{ 
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            py: { xs: 3, sm: 4 },
            px: { xs: 2, sm: 4 },
            textAlign: "center",
            color: "white"
          }}
        >
          <div className="flex justify-center mb-3">
            <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center">
              <CardGiftcard sx={{ fontSize: 40, color: "white" }} />
            </div>
          </div>
          
          {!showSuccessMessage ? (
            <>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                {t("welcomeOffer.title")}
              </h2>
              <p className="text-white/90 text-sm sm:text-base">
                {t("welcomeOffer.subtitle")}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                {t("welcomeOffer.successTitle")}
              </h2>
              <p className="text-white/90 text-sm sm:text-base">
                {t("welcomeOffer.successSubtitle")}
              </p>
            </>
          )}
        </Box>

        {/* Content */}
        <Box sx={{ px: { xs: 2, sm: 4 }, pb: { xs: 3, sm: 4 } }}>
          {!showSuccessMessage ? (
            // Initial offer state
            <>
              {/* Price highlight */}
              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-4xl sm:text-5xl font-bold text-primary">
                    €0.50
                  </span>
                </div>
                <p className="text-content-600 text-sm">
                  {t("welcomeOffer.priceDescription")}
                </p>
              </div>

              {/* CTA Button */}
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleGetOffer}
                sx={{
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
                  }
                }}
              >
                {t("welcomeOffer.getOfferButton")}
              </Button>

              <p className="text-xs text-content-500 text-center mt-3">
                {t("welcomeOffer.termsHint")}
              </p>
            </>
          ) : (
            // Success state - show promo code
            <>
              {/* Promo code box */}
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border-2 border-dashed border-primary-300 rounded-xl p-4 mb-4">
                <p className="text-sm text-content-600 mb-2 text-center">
                  {t("welcomeOffer.useCodeLabel")}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-primary tracking-wider">
                    {PROMO_CODE}
                  </span>
                  <IconButton 
                    onClick={handleCopyCode}
                    size="small"
                    sx={{ 
                      color: copied ? "success.main" : "primary.main",
                      transition: "color 0.2s"
                    }}
                  >
                    {copied ? <Check /> : <ContentCopy />}
                  </IconButton>
                </div>
              </div>

              {/* Sign up button */}
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleSignUp}
                sx={{
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
                  }
                }}
              >
                {t("welcomeOffer.signUpButton")}
              </Button>

              <p className="text-xs text-content-500 text-center mt-3">
                {t("welcomeOffer.checkoutHint")}
              </p>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Minimized Welcome Offer Widget
 * Shown after user dismisses the modal
 * Stays visible until user logs in
 */
export const WelcomeOfferWidget = ({ visible, onClick, onClose }) => {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <div 
      className="fixed bottom-6 left-1/2 z-40"
      style={{ 
        transform: "translateX(-50%)",
        animation: "bounce-gentle 2s infinite"
      }}
    >
      <style>
        {`
          @keyframes bounce-gentle {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(-5px); }
          }
        `}
      </style>
      <div 
        className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full shadow-lg flex items-center cursor-pointer hover:shadow-xl transition-shadow group"
        onClick={onClick}
      >
        <div className="flex items-center gap-2 py-2.5 px-4">
          <CardGiftcard sx={{ fontSize: 24, color: "#FFD700" }} />
          <span className="text-sm font-medium whitespace-nowrap">
            {t("welcomeOffer.widgetText")}
          </span>
        </div>
      </div>
    </div>
  );
};
