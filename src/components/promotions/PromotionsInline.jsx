import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { toast } from "react-toastify";
import { updateUserInfo } from "../../core/apis/authAPI";
import { UpdateAuthInfo } from "../../redux/reducers/authReducer";

/**
 * Inline version of Promotions Subscription component
 * Used in the Hooray/Order Success popup
 */
const PromotionsInline = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.authentication);
  const { user_info } = authState;

  const [isUpdating, setIsUpdating] = useState(false);
  // optedOut = true means user checked "I do not wish to receive" → should_notify = false
  const [optedOut, setOptedOut] = useState(user_info?.should_notify === false);

  const handleChange = async (checked) => {
    setOptedOut(checked);
    setIsUpdating(true);
    try {
      const res = await updateUserInfo({ should_notify: !checked });
      if (res?.data?.status) {
        dispatch(UpdateAuthInfo(res?.data?.data?.user_info));
      } else {
        toast.error(t("promotions.updateFailed"));
        setOptedOut(!checked);
      }
    } catch {
      toast.error(t("promotions.updateFailed"));
      setOptedOut(!checked);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center gap-2 mb-1.5">
        <MailOutlineIcon sx={{ fontSize: 18, color: '#7c6fcd', flexShrink: 0 }} />
        <p className="text-sm font-bold text-gray-800">
          {t("promotions.inline.title")}
        </p>
      </div>
      <p className="text-[0.7rem] text-gray-500 mb-2">
        {t("promotions.inline.description")}
      </p>
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={optedOut}
          onChange={(e) => handleChange(e.target.checked)}
          disabled={isUpdating}
          className="mt-0.5 flex-shrink-0 accent-[#009165]"
        />
        <span className="text-[0.65rem] text-gray-500 leading-snug">
          {t("promotions.inline.optOutLabel")}
        </span>
      </label>
    </div>
  );
};

export default PromotionsInline;
