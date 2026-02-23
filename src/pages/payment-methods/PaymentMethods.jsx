import React from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "react-toastify";
import {
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Skeleton,
} from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LinkIcon from "@mui/icons-material/Link";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import {
  getPaymentMethods,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  getAutoTopupConfigs,
} from "../../core/apis/userAPI";
import { useState } from "react";

/**
 * PaymentMethods page — displays saved payment methods, lets user
 * set default or delete them. Accessible from /payment-methods.
 */
const PaymentMethods = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const {
    data: methods,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => getPaymentMethods().then((res) => {
      const data = res?.data?.data?.payment_methods;
      return Array.isArray(data) ? data : [];
    }),
    refetchOnMount: "always",
    staleTime: 0,
  });

  // Check if user has any active auto-topup configs
  const { data: autoTopupConfigs } = useQuery({
    queryKey: ["auto-topup-configs"],
    queryFn: () => getAutoTopupConfigs().then((res) => {
      const configs = res?.data?.data?.configs;
      return Array.isArray(configs) ? configs : [];
    }),
  });

  // Check if any auto-topup is enabled
  const hasActiveAutoTopup = autoTopupConfigs?.some(config => config.enabled) || false;

  const setDefaultMutation = useMutation({
    mutationFn: (pmId) => setDefaultPaymentMethod(pmId),
    onSuccess: () => {
      toast.success(t("paymentMethods.setDefaultSuccess"));
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      // Auto-topup configs are updated on backend when setting new default
      queryClient.invalidateQueries({ queryKey: ["auto-topup-configs"] });
    },
    onError: () => toast.error(t("paymentMethods.setDefaultError")),
  });

  const deleteMutation = useMutation({
    mutationFn: (pmId) => deletePaymentMethod(pmId),
    onMutate: async (pmId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["payment-methods"] });
      
      // Snapshot the previous value
      const previousMethods = queryClient.getQueryData(["payment-methods"]);
      
      // Optimistically update to remove the payment method
      queryClient.setQueryData(["payment-methods"], (old) => 
        old ? old.filter((pm) => pm.id !== pmId) : []
      );
      
      // Return context with the snapshot
      return { previousMethods };
    },
    onSuccess: () => {
      toast.success(t("paymentMethods.deleteSuccess"));
      setDeleteTarget(null);
      // No refetch needed - optimistic update is the truth
    },
    onError: (err, pmId, context) => {
      // Rollback to the previous value on error
      queryClient.setQueryData(["payment-methods"], context?.previousMethods);
      toast.error(t("paymentMethods.deleteError"));
      // Refetch to ensure we have accurate data after error
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      queryClient.invalidateQueries({ queryKey: ["auto-topup-configs"] });
    },
  });

  const getBrandIcon = (brand) => {
    const brandLower = (brand || "").toLowerCase();
    switch (brandLower) {
      case "visa":
        return "💳 Visa";
      case "mastercard":
        return "💳 Mastercard";
      case "amex":
        return "💳 Amex";
      default:
        return "💳 " + (brand || "Card");
    }
  };

  const isCardExpired = (pm) => {
    // Only check expiration for card type
    if (pm.type !== "card") return false;
    
    const expMonth = pm.exp_month || pm.metadata?.exp_month;
    const expYear = pm.exp_year || pm.metadata?.exp_year;
    
    if (!expMonth || !expYear) return false;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    
    // Card expires at the end of the expiration month
    return expYear < currentYear || (expYear === currentYear && expMonth < currentMonth);
  };

  const anonymizeEmail = (email) => {
    if (!email) return "";
    const [localPart, domain] = email.split("@");
    if (!localPart || !domain) return email;
    
    // Show first 2 characters and mask the rest of local part
    const visibleChars = Math.min(2, localPart.length);
    const masked = localPart.substring(0, visibleChars) + "**";
    return `${masked}@${domain}`;
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t("paymentMethods.title")}</h1>
        <p className="text-content-500 text-sm mt-1">
          {t("paymentMethods.subtitle")}
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} variant="rectangular" height={80} className="rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!methods || methods.length === 0) && (
        <Card variant="outlined" className="!rounded-xl">
          <CardContent className="flex flex-col items-center gap-4 !py-10">
            <CreditCardIcon sx={{ fontSize: 48, color: "#9ca3af" }} />
            <p className="text-content-500 text-center text-sm max-w-sm">
              {t("paymentMethods.noMethods")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* header note for auto-topup restriction */}
      {hasActiveAutoTopup && (
        <Card variant="outlined" className="!rounded-xl" sx={{ borderColor: "#f59e0b", bgcolor: "#fffbeb" }}>
          <CardContent className="!py-3">
            <div className="flex items-start gap-2">
              <InfoOutlinedIcon sx={{ fontSize: 20, color: "#f59e0b", mt: 0.25 }} />
              <p className="text-sm" style={{ color: "#92400e" }}>
                {t("paymentMethods.autoTopupRestrictionNote")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment method cards */}
      {Array.isArray(methods) && methods.map((pm) => {
        const expired = isCardExpired(pm);
        return (
        <Card
          key={pm.id}
          variant="outlined"
          className="!rounded-xl"
          sx={
            pm.is_default
              ? { borderColor: "#906bae", borderWidth: 2 }
              : expired
              ? { borderColor: "#ef4444", borderWidth: 1, opacity: 0.7 }
              : {}
          }
        >
          <CardContent className="flex items-center justify-between !py-4">
            {/* Left: card info */}
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {pm.type === "link" ? (
                  <LinkIcon color="primary" />
                ) : (
                  <CreditCardIcon color={expired ? "error" : "primary"} />
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-semibold text-sm ${expired ? 'line-through' : ''}`}>
                    {pm.type === "link" 
                      ? `🔗 Stripe Link - ${anonymizeEmail(pm.metadata?.email)}`
                      : `${getBrandIcon(pm.brand || pm.metadata?.brand)} •••• ${pm.last4 || pm.metadata?.last4}`
                    }
                  </span>
                  {pm.is_default && (
                    <Chip
                      label={t("paymentMethods.default")}
                      size="small"
                      sx={{
                        backgroundColor: "#f3e8ff",
                        color: "#7c3aed",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        height: 22,
                      }}
                    />
                  )}
                  {expired && (
                    <Chip
                      label={t("paymentMethods.expired")}
                      size="small"
                      sx={{
                        backgroundColor: "#fee2e2",
                        color: "#dc2626",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        height: 22,
                      }}
                    />
                  )}
                </div>
                {(pm.exp_month || pm.metadata?.exp_month) && (
                  <span className={`text-xs ${expired ? 'text-red-500' : 'text-content-500'}`}>
                    {t("paymentMethods.expires")} {pm.exp_month || pm.metadata?.exp_month}/
                    {pm.exp_year || pm.metadata?.exp_year}
                  </span>
                )}
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-1">
              {!pm.is_default && !expired && (
                <IconButton
                  size="small"
                  onClick={() => setDefaultMutation.mutate(pm.id)}
                  disabled={setDefaultMutation.isLoading}
                  title={t("paymentMethods.setDefault")}
                >
                  <StarBorderIcon fontSize="small" color="primary" />
                </IconButton>
              )}
              {pm.is_default && (
                <IconButton size="small" disabled>
                  <StarIcon fontSize="small" sx={{ color: "#7c3aed" }} />
                </IconButton>
              )}
              {/* Hide delete icon for default payment method if auto-topup is active */}
              {!(pm.is_default && hasActiveAutoTopup) && (
                <IconButton
                  size="small"
                  onClick={() => setDeleteTarget(pm)}
                  title={t("paymentMethods.delete")}
                >
                  <DeleteOutlineIcon fontSize="small" color="error" />
                </IconButton>
              )}
            </div>
          </CardContent>
        </Card>
        );
      })}

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
      >
        <DialogTitle>{t("paymentMethods.confirmDelete")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteTarget?.is_default 
              ? t("paymentMethods.confirmDeleteDefaultDescription")
              : t("paymentMethods.confirmDeleteDescription")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} color="primary">
            {t("autoTopup.no")}
          </Button>
          <Button
            onClick={() => deleteMutation.mutate(deleteTarget?.id)}
            color="error"
            variant="contained"
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              t("paymentMethods.delete")
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PaymentMethods;
