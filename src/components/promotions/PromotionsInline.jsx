import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Switch,
  FormControlLabel,
  Box,
} from "@mui/material";
import { LocalOffer } from "@mui/icons-material";
import { toast } from "react-toastify";
import { updateUserInfo } from "../../core/apis/authAPI";
import { UpdateAuthInfo } from "../../redux/reducers/authReducer";
import { isUserAuthenticated } from "../../core/utils/authHelpers";

/**
 * Inline version of Promotions Subscription component
 * Used in the Hooray/Order Success popup
 */
const PromotionsInline = () => {
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

  // Don't show if user already has notifications enabled
  if (shouldNotify && !isUpdating) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-warning-50 to-primary-50 rounded-xl p-6 border-2 border-warning-200">
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <LocalOffer className="text-warning text-2xl" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-content-900 text-lg mb-2">
            {t("promotions.inline.title")}
          </h3>
          <p className="text-sm text-content-600 leading-relaxed">
            {t("promotions.inline.description")}
          </p>
        </div>
      </div>

      {/* Toggle */}
      <Box className="bg-white p-4 rounded-lg shadow-sm">
        <FormControlLabel
          control={
            <Switch
              checked={shouldNotify}
              onChange={(e) => handleToggleNotifications(e.target.checked)}
              disabled={isUpdating}
              color="warning"
            />
          }
          label={
            <span className="text-sm font-medium text-content-800">
              {shouldNotify
                ? t("promotions.inline.toggleEnabled")
                : t("promotions.inline.toggleDisabled")}
            </span>
          }
        />
      </Box>

      {/* Disclaimer */}
      <p className="text-xs text-content-500 mt-4 leading-relaxed text-center">
        {t("promotions.inline.disclaimer")}
      </p>
    </div>
  );
};

export default PromotionsInline;
