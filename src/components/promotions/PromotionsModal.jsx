import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  IconButton,
  Button,
  Switch,
  FormControlLabel,
  Box,
} from "@mui/material";
import { Close, LocalOffer, Notifications } from "@mui/icons-material";
import { toast } from "react-toastify";
import { updateUserInfo } from "../../core/apis/authAPI";
import { UpdateAuthInfo } from "../../redux/reducers/authReducer";
import { isUserAuthenticated } from "../../core/utils/authHelpers";

/**
 * Modal version of Promotions Subscription component
 * Used on data plans, my esim, and orders history pages
 */
const PromotionsModal = ({ open, onClose, onDismiss, onRemindLater, onDontShowAgain }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authState = useSelector((state) => state.authentication);
  const { user_info } = authState;
  const isAuth = isUserAuthenticated(authState);

  const [isUpdating, setIsUpdating] = useState(false);
  const [shouldNotify, setShouldNotify] = useState(
    user_info?.should_notify || false
  );

  const handleToggleNotifications = async (checked) => {
    if (!isAuth) {
      toast.info(t("promotions.signInRequired"));
      navigate("/signin");
      return;
    }

    setShouldNotify(checked);
    setIsUpdating(true);

    try {
      const payload = {
        should_notify: checked,
      };

      const res = await updateUserInfo(payload);
      const statusBool = res?.data?.status;

      if (statusBool) {
        dispatch(UpdateAuthInfo(res?.data?.data?.user_info));
        toast.success(
          checked
            ? t("promotions.enabledSuccess")
            : t("promotions.disabledSuccess")
        );
        
        // If user enabled notifications, close the modal
        if (checked && onClose) {
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } else {
        toast.error(t("promotions.updateFailed"));
        setShouldNotify(!checked);
      }
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      toast.error(t("promotions.updateFailed"));
      setShouldNotify(!checked);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    if (onDismiss) onDismiss();
    if (onClose) onClose();
  };

  const handleRemindLater = () => {
    if (onRemindLater) onRemindLater();
    if (onClose) onClose();
  };

  const handleDontShowAgain = () => {
    if (onDontShowAgain) onDontShowAgain();
    if (onClose) onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleDismiss} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: { xs: '95vh', sm: '90vh' },
          margin: { xs: 1, sm: 2, md: 3 }
        }
      }}
    >
      <DialogContent className="flex flex-col gap-3 md:gap-5 !px-4 !py-4 sm:!px-6 sm:!py-6 md:!px-8 md:!py-7 relative">
        {/* Close Button */}
        <IconButton
          aria-label="close"
          onClick={handleDismiss}
          size="small"
          sx={() =>
            localStorage.getItem("i18nextLng") === "ar"
              ? {
                  position: "absolute",
                  left: 4,
                  top: 4,
                  color: "text.secondary",
                }
              : {
                  position: "absolute",
                  right: 4,
                  top: 4,
                  color: "text.secondary",
                }
          }
        >
          <Close fontSize="small" />
        </IconButton>

        {/* Icon + Title Combined in One Row */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="bg-gradient-to-br from-warning-100 to-warning-50 w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
              <LocalOffer className="text-warning text-xl md:text-2xl" />
            </div>
            <h2 className="text-lg md:text-2xl font-bold text-content-900">
              {t("promotions.modal.title")}
            </h2>
          </div>
          <p className="text-content-600 text-xs md:text-base leading-snug md:leading-relaxed px-2">
            {t("promotions.modal.subtitle")}
          </p>
        </div>

        {/* Marketing Content - Compact */}
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-3 md:p-5 rounded-lg md:rounded-xl space-y-2 md:space-y-3">
          <div className="flex items-start gap-2">
            <Notifications className="text-primary-700 mt-0.5 flex-shrink-0 text-lg md:text-xl" />
            <div className="min-w-0">
              <h3 className="font-semibold text-xs md:text-sm text-content-900 mb-0.5">
                {t("promotions.modal.benefit1Title")}
              </h3>
              <p className="text-xs md:text-sm text-content-600 leading-snug">
                {t("promotions.modal.benefit1Description")}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <LocalOffer className="text-warning mt-0.5 flex-shrink-0 text-lg md:text-xl" />
            <div className="min-w-0">
              <h3 className="font-semibold text-xs md:text-sm text-content-900 mb-0.5">
                {t("promotions.modal.benefit2Title")}
              </h3>
              <p className="text-xs md:text-sm text-content-600 leading-snug">
                {t("promotions.modal.benefit2Description")}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 md:w-5 md:h-5 text-success mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="min-w-0">
              <h3 className="font-semibold text-xs md:text-sm text-content-900 mb-0.5">
                {t("promotions.modal.benefit3Title")}
              </h3>
              <p className="text-xs md:text-sm text-content-600 leading-snug">
                {t("promotions.modal.benefit3Description")}
              </p>
            </div>
          </div>
        </div>

        {/* Toggle Section - Compact */}
        <Box className="bg-gradient-to-r from-warning-50 to-primary-50 p-3 md:p-4 rounded-lg md:rounded-xl border-2 border-warning-200">
          <FormControlLabel
            control={
              <Switch
                checked={shouldNotify}
                onChange={(e) => handleToggleNotifications(e.target.checked)}
                disabled={isUpdating}
                color="warning"
                size="small"
              />
            }
            label={
              <div className="ml-1">
                <div className="font-semibold text-xs md:text-sm text-content-900">
                  {shouldNotify
                    ? t("promotions.modal.toggleEnabled")
                    : t("promotions.modal.toggleDisabled")}
                </div>
                <div className="text-xs text-content-600 mt-0.5 leading-snug">
                  {t("promotions.modal.toggleHint")}
                </div>
              </div>
            }
            className="m-0 w-full"
          />
        </Box>

        {/* Disclaimer - Compact */}
        <p className="text-xs text-content-500 text-center leading-snug px-2">
          {t("promotions.modal.disclaimer")}
        </p>

        {/* Action Buttons - Side by side on desktop, stacked on mobile */}
        <div className="flex flex-col sm:flex-row gap-2 mt-0">
          <Button
            variant="text"
            size="small"
            onClick={handleRemindLater}
            className="text-content-600"
            sx={{ textTransform: "none", flex: 1, fontSize: { xs: '0.75rem', md: '0.875rem' }, py: { xs: 0.5, md: 1 } }}
          >
            {t("promotions.modal.remindLater")}
          </Button>
          <Button
            variant="text"
            size="small"
            onClick={handleDontShowAgain}
            className="text-content-400"
            sx={{ textTransform: "none", fontSize: '0.7rem', flex: 1, py: { xs: 0.5, md: 1 } }}
          >
            {t("promotions.modal.dontShowAgain")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromotionsModal;
