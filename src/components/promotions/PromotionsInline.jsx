import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Switch } from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
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
    <div className="flex flex-col gap-2 sm:gap-3 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex items-center gap-2">
        <NotificationsNoneIcon sx={{ fontSize: { xs: 18, sm: 20 }, color: '#d97706', flexShrink: 0 }} />
        <p className="text-xs sm:text-sm font-semibold text-amber-900 flex-1 leading-tight">
          {t("promotions.inline.title")}
        </p>
        <Switch
          checked={shouldNotify}
          onChange={(e) => handleToggleNotifications(e.target.checked)}
          disabled={isUpdating}
          color="warning"
          size="small"
          sx={{ flexShrink: 0 }}
        />
      </div>
      <p className="text-[0.65rem] leading-tight sm:text-xs text-amber-700 pl-[26px]">
        {t("promotions.inline.description")}
      </p>
    </div>
  );
};

export default PromotionsInline;
