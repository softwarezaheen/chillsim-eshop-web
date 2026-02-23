import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Checkbox,
  Collapse,
  FormControlLabel,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import { formatValidity } from "../../assets/utils/formatValidity";

/**
 * AutoTopupCheckoutOption
 * Checkbox component for checkout flow to enable auto top-up with purchased bundle
 *
 * Props:
 *   bundleData         — Bundle being purchased
 *   iccid              — eSIM ICCID (for top-ups)
 *   userProfileId      — User profile ID
 *   onAutoTopupChange  — Callback with (enabled, monthlyCap)
 */
const AutoTopupCheckoutOption = ({
  bundleData,
  iccid,
  userProfileId,
  onAutoTopupChange,
}) => {
  const { t } = useTranslation();
  const [enableAutoTopup, setEnableAutoTopup] = useState(false);
  const [monthlyCap, setMonthlyCap] = useState("0");

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setEnableAutoTopup(checked);
    onAutoTopupChange(checked, monthlyCap);
  };

  const handleMonthlyCapChange = (e) => {
    const value = e.target.value;
    setMonthlyCap(value);
    if (enableAutoTopup) {
      onAutoTopupChange(true, value);
    }
  };

  if (!bundleData || !iccid) {
    return null; // Only show for top-up purchases
  }

  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        border: "1px solid",
        borderColor: enableAutoTopup ? "primary.main" : "grey.300",
        borderRadius: 1,
        bgcolor: enableAutoTopup ? "primary.50" : "transparent",
        transition: "all 0.3s",
      }}
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={enableAutoTopup}
            onChange={handleCheckboxChange}
            color="primary"
          />
        }
        label={
          <Box display="flex" alignItems="center" gap={1}>
            <BoltIcon sx={{ color: "#10b981", fontSize: { xs: "1.2rem", sm: "1.5rem" }, display: { xs: "none", sm: "block" } }} />
            <Box>
              <Typography 
                fontWeight="bold"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                {t("autoTopup.enableAutoTopupCheckbox")}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}
              >
                {t("autoTopup.neverRunOutOfData")} - {t("autoTopup.autoRechargeAt80")}
              </Typography>
            </Box>
          </Box>
        }
      />

      <Collapse in={enableAutoTopup}>
        <Box sx={{ mt: 2, ml: { xs: 0, sm: 5 } }}>
          {/* Bundle preview */}
          <Box sx={{ bgcolor: "grey.50", p: 2, mb: 2, borderRadius: 1 }}>
            <Typography
              variant="caption"
              color="primary"
              fontWeight="bold"
              textTransform="uppercase"
            >
              {t("autoTopup.linkedTopUpPlan")}
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="start" mt={1}>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="#8B6914">
                  {bundleData.display_title || bundleData.bundle_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {bundleData.gprs_limit_display}
                  {bundleData.validity_display && `, ${formatValidity(bundleData.validity_display)}`}
                </Typography>
              </Box>
              <Box textAlign="right">
                {bundleData.price != null && (
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    €{typeof bundleData.price === "number"
                      ? bundleData.price.toFixed(2)
                      : bundleData.price}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  {t("autoTopup.perTopUp")}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Monthly cap - HIDDEN 
          <TextField
            label={t("autoTopup.monthlyCap")}
            type="number"
            value={monthlyCap}
            onChange={handleMonthlyCapChange}
            inputProps={{ min: 0, step: 1 }}
            InputProps={{
              startAdornment: <InputAdornment position="start">€</InputAdornment>,
              endAdornment: <InputAdornment position="end">/mo</InputAdornment>,
            }}
            helperText={t("autoTopup.monthlyCapHelp")}
            fullWidth
          />
          */}
        </Box>
      </Collapse>
    </Box>
  );
};

export default AutoTopupCheckoutOption;
