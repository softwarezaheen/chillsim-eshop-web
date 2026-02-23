import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "react-toastify";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  DialogContentText,
  Switch,
  TextField,
  Alert,
  IconButton,
  InputAdornment,
  Chip,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import BoltIcon from "@mui/icons-material/Bolt";
import InfoIcon from "@mui/icons-material/Info";
import SaveIcon from "@mui/icons-material/Save";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  getAutoTopupConfig,
  disableAutoTopup,
  enableAutoTopup,
  updateAutoTopupConfig,
} from "../../core/apis/userAPI";
import { formatValidity } from "../../assets/utils/formatValidity";

/**
 * AutoTopupModal — modal dialog for managing auto top-up settings
 *
 * Props:
 *   open               — whether modal is open
 *   onClose            — callback to close modal
 *   iccid              — eSIM ICCID
 *   bundleCode         — current active bundle code (for enable)
 *   bundleName         — display name of the active bundle
 *   bundleData         — full bundle object (for preview when disabled)
 *   labelName          — custom user label for the eSIM
 *   userProfileId      — user_profile_id for the eSIM
 *   isAutoTopupEnabled — whether auto-topup is currently enabled
 */
const AutoTopupModal = ({
  open,
  onClose,
  iccid,
  bundleCode,
  bundleName,
  bundleData,
  labelName,
  userProfileId,
  isAutoTopupEnabled = false,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [autoTopupToggle, setAutoTopupToggle] = useState(isAutoTopupEnabled);
  const [maxAmountEuros, setMaxAmountEuros] = useState("");

  // Sync toggle with prop when modal opens
  useEffect(() => {
    setAutoTopupToggle(isAutoTopupEnabled);
  }, [isAutoTopupEnabled, open]);

  // Fetch auto-topup config when modal is open (even when disabled for preview)
  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: [`auto-topup-config-${iccid}`],
    queryFn: async () => {
      if (isAutoTopupEnabled) {
        return getAutoTopupConfig(iccid).then((res) => res?.data?.data);
      }
      // When disabled, return placeholder config from bundleData
      return {
        bundle_data: bundleData || {
          bundle_name: bundleName,
          bundle_code: bundleCode,
          gprs_limit_display: bundleData?.gprs_limit_display || "N/A",
          validity_display: bundleData?.validity_display || "N/A",
          price: bundleData?.price || 0,
        },
        max_amount_cents: 0,
      };
    },
    enabled: Boolean(iccid && open),
    refetchOnMount: 'always',
    retry: false,
    onSuccess: (data) => {
      // Initialize max amount in euros from fetched config (convert cents to euros)
      if (data?.max_amount_cents != null) {
        setMaxAmountEuros((data.max_amount_cents / 100).toString());
      } else {
        setMaxAmountEuros("0");
      }
    },
    onError: () => {
      // Config not found is expected — means not enabled
      setMaxAmountEuros("0");
    },
  });

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: [`auto-topup-config-${iccid}`] });
    queryClient.invalidateQueries({ queryKey: ["my-esim"] });
    queryClient.invalidateQueries({ queryKey: [`esim-detail-${iccid}`] });
  };

  const enableMutation = useMutation({
    mutationFn: () =>
      enableAutoTopup({
        iccid,
        bundle_code: bundleCode,
        user_profile_id: userProfileId,
      }),
    onSuccess: () => {
      toast.success(t("autoTopup.enabledSuccess"));
      setAutoTopupToggle(true);
      invalidateQueries();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || t("autoTopup.enableError")
      );
      setAutoTopupToggle(false);
    },
  });

  const disableMutation = useMutation({
    mutationFn: () => disableAutoTopup({ iccid }),
    onSuccess: () => {
      toast.success(t("autoTopup.disableSuccess"));
      setAutoTopupToggle(false);
      setConfirmOpen(false);
      invalidateQueries();
      onClose();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || t("autoTopup.disableError")
      );
      setAutoTopupToggle(true);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ maxAmountEuros }) => {
      const cents = Math.round(parseFloat(maxAmountEuros) * 100);
      return updateAutoTopupConfig({
        iccid,
        max_amount_cents: cents,
      });
    },
    onSuccess: () => {
      toast.success(t("autoTopup.savedSuccess"));
      invalidateQueries();
      onClose();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || t("autoTopup.saveError")
      );
    },
  });

  const handleToggle = (event) => {
    const checked = event.target.checked;
    if (checked) {
      enableMutation.mutate();
    } else {
      setConfirmOpen(true);
    }
  };

  const handleSave = (e) => {
    e?.preventDefault();

    if (
      maxAmountEuros === "" ||
      maxAmountEuros === null ||
      maxAmountEuros === undefined
    ) {
      toast.error(t("autoTopup.monthlyCapRequired"));
      return;
    }
    const amountNum = parseFloat(maxAmountEuros);
    if (isNaN(amountNum) || amountNum < 0) {
      toast.error(t("autoTopup.monthlyCapRequired"));
      return;
    }
    updateMutation.mutate({ maxAmountEuros: amountNum.toString() });
  };

  const isProcessing =
    enableMutation.isLoading ||
    disableMutation.isLoading ||
    configLoading ||
    updateMutation.isLoading;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent className="flex flex-col gap-[1rem] !px-0 !py-0">
          {/* Close button */}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={() =>
              localStorage.getItem("i18nextLng") === "ar"
                ? {
                    position: "absolute",
                    left: 8,
                    top: 8,
                    color: "white",
                    zIndex: 1,
                  }
                : {
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: "white",
                    zIndex: 1,
                  }
            }
          >
            <Close />
          </IconButton>

          {/* Header with toggle */}
          <Box
            sx={{
              bgcolor: "#8e44ad",
              color: "white",
              p: { xs: 2, sm: 3 },
              borderRadius: "8px 8px 0 0",
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <BoltIcon />
                <Typography variant="h6" fontWeight="bold" sx={{ color: "#d3dc47", fontSize: {xs:'0.875rem',sm: '1rem', md:'1.2rem'} }}>
                  {t("autoTopup.settingsTitle")}
                </Typography>
              </Box>
              
            </Box>
            <Box display="flex" alignItems={"center"} justifyContent={"space-between"} mb="1">
                <Typography variant="body2" color="white" sx={{ opacity: 0.9, fontSize: {xs:'0.6rem',sm: '0.75rem'} }}>
                    {t("autoTopup.neverRunOutOfData")}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" fontWeight="medium" sx={{ fontSize: {xs:'0.65rem',sm: '0.75rem'} }}>
                    {autoTopupToggle ? t("autoTopup.active") : t("autoTopup.inactive")}
                    </Typography>
                    <Switch
                    checked={autoTopupToggle}
                    onChange={handleToggle}
                    disabled={isProcessing}
                    color="secondary"
                    size="small"
                    />
                </Box>
            </Box>
            
            <Typography variant="caption" color="white" sx={{ opacity: 0.8, display: 'block', mt: 1, fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>
              {t("autoTopup.iccidSerial")}
            </Typography>
            <Typography variant="body2" fontWeight="medium" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
              <span dir="ltr">{iccid}</span>
            </Typography>
          </Box>

          {/* eSIM Label */}
          <Box px={{ xs: 2, sm: 3 }} pt={2}>
            {labelName && (
              <>
                <Typography variant="body2" fontWeight="medium" mb={1} sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                  {labelName}
                </Typography>
              </>
            )}
          </Box>

          {labelName && (<Divider />)}

          {/* Auto-topup settings content - always visible */}
          <Box px={{ xs: 2, sm: 3 }} pb={{ xs: 2, sm: 3 }}>
              {/* Warning message - only show when enabled */}
              {autoTopupToggle && (
                <Alert
                  severity="warning"
                  icon={<WarningAmberIcon />}
                  sx={{ 
                    mb: { xs: 2, sm: 3 },
                    py: { xs: 0.5, sm: 1 },
                    '& .MuiAlert-message': {
                      fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' }
                    }
                  }}
                >
                  {t("autoTopup.packageRestrictionWarning")}
                </Alert>
              )}

              {/* Info message when disabled */}
              {!autoTopupToggle && (
                <Alert
                  severity="info"
                  sx={{ 
                    mb: { xs: 2, sm: 3 },
                    py: { xs: 0.5, sm: 1 },
                    '& .MuiAlert-message': {
                      fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' }
                    }
                  }}
                >
                  Configure settings below and toggle to enable auto top-up
                </Alert>
              )}

              {/* Linked Top-Up Plan */}
              {config?.bundle_data && (
                <Box mb={{ xs: 2, sm: 3 }}>
                  <Typography
                    variant="caption"
                    color="primary"
                    fontWeight="bold"
                    textTransform="uppercase"
                    mb={1}
                    display="block"
                  >
                    {t("autoTopup.linkedTopUpPlan")}
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: "grey.50",
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "grey.200",
                    }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="start"
                    >
                      <Box>
                        <Typography variant="h6" fontWeight="bold" color="#8B6914" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                          {config.bundle_data.bundle_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {config.bundle_data.gprs_limit_display + ', ' + formatValidity(config.bundle_data.validity_display)}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        {config.bundle_data.price != null && (
                          <Typography variant="h6" color="primary" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                            €
                            {typeof config.bundle_data.price === "number"
                              ? config.bundle_data.price.toFixed(2)
                              : config.bundle_data.price}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          {t("autoTopup.perTopUp")}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Monthly Spending Cap - HIDDEN */}
              {/* <Box mb={{ xs: 2, sm: 3 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="body1" fontWeight="bold">
                    {t("autoTopup.monthlyCap")}
                  </Typography>
                  <InfoIcon fontSize="small" color="action" />
                </Box>
                <TextField
                  fullWidth
                  type="number"
                  value={maxAmountEuros}
                  onChange={(e) => setMaxAmountEuros(e.target.value)}
                  inputProps={{ min: 0, step: 1 }}
                  disabled={isProcessing}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">€</InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">/mo</InputAdornment>
                    ),
                  }}
                />
                <Typography variant="caption" color="text.secondary" mt={1} display="block">
                  {t("autoTopup.monthlyCapHelp")}
                </Typography>
              </Box> */}

              {/* Status Information */}
              {config && (
                <Box mb={2}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {t("autoTopup.status")}
                    </Typography>
                    <Chip
                      label={t("autoTopup.active")}
                      color="success"
                      size="small"
                    />
                  </Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="text.secondary">
                      {t("autoTopup.triggerPoint")}
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {t("autoTopup.at80Percent")}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Save Changes Button - only show when enabled */}
              {/* {autoTopupToggle && (
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleSave}
                  disabled={isProcessing}
                  startIcon={
                    updateMutation.isLoading ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                >
                  {t("autoTopup.saveChanges")}
                </Button>
              )} */}
            </Box>
        </DialogContent>
      </Dialog>

      {/* Disable confirmation dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
      >
        <DialogTitle>{t("autoTopup.confirmDisable")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("autoTopup.confirmDisableDescription")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="primary">
            {t("autoTopup.no")}
          </Button>
          <Button
            onClick={() => disableMutation.mutate()}
            color="error"
            variant="contained"
            disabled={disableMutation.isLoading}
          >
            {disableMutation.isLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              t("autoTopup.yes")
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AutoTopupModal;
