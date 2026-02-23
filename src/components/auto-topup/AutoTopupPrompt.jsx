import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import { toast } from "react-toastify";
import { Switch, CircularProgress } from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import { enableAutoTopup, disableAutoTopup } from "../../core/apis/userAPI";

const AutoTopupPrompt = ({ iccid, bundleId, bundleName, dataAmount, validity }) => {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(false);

  const { mutate: doEnable, isLoading: isEnabling } = useMutation({
    mutationFn: () =>
      enableAutoTopup({
        iccid,
        bundle_id: bundleId,
      }),
    onSuccess: () => {
      setEnabled(true);
      toast.success(t("autoTopup.enabledSuccess"));
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || t("autoTopup.enableError");
      toast.error(msg);
      setEnabled(false);
    },
  });

  const { mutate: doDisable, isLoading: isDisabling } = useMutation({
    mutationFn: () => disableAutoTopup({ iccid }),
    onSuccess: () => {
      setEnabled(false);
      toast.success(t("autoTopup.disableSuccess"));
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || t("autoTopup.disableError");
      toast.error(msg);
      setEnabled(true);
    },
  });

  const isLoading = isEnabling || isDisabling;

  const handleToggle = () => {
    if (isLoading) return;
    if (enabled) {
      doDisable();
    } else {
      setEnabled(true);
      doEnable();
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:gap-3 p-3 sm:p-4 bg-purple-50 border border-purple-200 rounded-lg">
      <div className="flex items-center gap-2">
        <BoltIcon sx={{ fontSize: { xs: 18, sm: 20 }, color: '#906bae', flexShrink: 0 }} />
        <p className="text-xs sm:text-sm font-semibold text-purple-900 flex-1 leading-tight">
          {t("autoTopup.promptTitle")}
        </p>
        {isLoading ? (
          <CircularProgress size={16} sx={{ color: '#906bae', flexShrink: 0 }} />
        ) : (
          <Switch
            checked={enabled}
            onChange={handleToggle}
            disabled={isLoading}
            size="small"
            sx={{
              flexShrink: 0,
              '& .MuiSwitch-switchBase.Mui-checked': { color: '#906bae' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#906bae' },
            }}
          />
        )}
      </div>
      <p className="text-[0.65rem] leading-tight sm:text-xs text-purple-700 pl-[26px]">
        {enabled
          ? t("autoTopup.enabledConfirmation", { bundle: bundleName })
          : t("autoTopup.promptDescription", { bundle: bundleName, data: dataAmount, validity: validity })}
      </p>
    </div>
  );
};

export default AutoTopupPrompt;
