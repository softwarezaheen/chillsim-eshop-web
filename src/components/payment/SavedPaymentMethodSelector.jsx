import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  Skeleton,
  Chip,
  Button,
} from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AddCardIcon from "@mui/icons-material/AddCard";
import LinkIcon from "@mui/icons-material/Link";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { getPaymentMethods } from "../../core/apis/userAPI";

/**
 * Displays saved payment methods with radio selection
 * Allows user to choose between saved cards, new card, or wallet
 */
const SavedPaymentMethodSelector = ({ 
  selectedPaymentMethodId, 
  onPaymentMethodChange,
  showWalletOption = false,
  walletBalance = 0,
  currency = "EUR",
  isWalletSufficient = false
}) => {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  
  const { data: paymentMethods, isLoading } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => getPaymentMethods(),
    refetchOnMount: "always", // Always fetch fresh data when component mounts
    staleTime: 0, // Consider data stale immediately
  });

  // Sort: default card first, then others. Filter expired last (expired stay but greyed out).
  const methods = useMemo(() => {
    const raw = paymentMethods?.data?.data?.payment_methods || [];
    return [...raw].sort((a, b) => {
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      return 0;
    });
  }, [paymentMethods]);

  // Show only the first (default) card initially; reveal all on "Load more"
  const INITIAL_COUNT = 1;
  const visibleMethods = showAll ? methods : methods.slice(0, INITIAL_COUNT);
  const hiddenCount = methods.length - INITIAL_COUNT;
  const hasMore = !showAll && hiddenCount > 0;

  const hasSavedMethods = methods.length > 0;

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

  const anonymizeEmail = (email) => {
    if (!email) return "";
    const [localPart, domain] = email.split("@");
    if (!localPart || !domain) return email;
    
    const visibleChars = Math.min(2, localPart.length);
    const masked = localPart.substring(0, visibleChars) + "**";
    return `${masked}@${domain}`;
  };

  const isCardExpired = (pm) => {
    if (pm.type !== "card") return false;
    
    const expMonth = pm.exp_month || pm.metadata?.exp_month;
    const expYear = pm.exp_year || pm.metadata?.exp_year;
    
    if (!expMonth || !expYear) return false;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    return expYear < currentYear || (expYear === currentYear && expMonth < currentMonth);
  };

  const formatCurrency = (amount, currencyCode) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      return `${amount.toFixed(2)} ${currencyCode}`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton variant="rectangular" height={80} className="rounded-xl" />
        <Skeleton variant="rectangular" height={80} className="rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
        {/* Wallet option */}
        {showWalletOption && (
          <Card 
            variant="outlined" 
            className="!rounded-xl cursor-pointer hover:border-primary-500 transition-colors"
            sx={{
              borderWidth: selectedPaymentMethodId === "wallet" ? 2 : 1,
              borderColor: selectedPaymentMethodId === "wallet" ? "#906bae" : 
                          !isWalletSufficient ? "#ef4444" : undefined,
              opacity: !isWalletSufficient ? 0.6 : 1,
              mb: 1,
            }}
            onClick={() => isWalletSufficient && onPaymentMethodChange("wallet")}
          >
            <CardContent className="!py-3 !px-4">
              <div className="flex items-center gap-3 w-full">
                <AccountBalanceWalletIcon sx={{ fontSize: 28, color: !isWalletSufficient ? "#ef4444" : "#906bae" }} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm flex items-center gap-2 flex-wrap">
                    <span>{t("payment.wallet")}</span>
                    <span className={`font-normal ${!isWalletSufficient ? 'text-red-500' : 'text-content-500'}`}>
                      {formatCurrency(walletBalance, currency)}
                    </span>
                  </div>
                  {!isWalletSufficient && (
                    <p className="text-xs text-red-500 mt-0.5 font-medium">
                      {t("payment.insufficientBalance")}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Saved payment methods - default first, limited to INITIAL_COUNT until expanded */}
        {hasSavedMethods && visibleMethods.map((pm) => {
          const expired = isCardExpired(pm);
          const isDisabled = expired;

          return (
            <Card
              key={pm.id}
              variant="outlined"
              className="!rounded-xl cursor-pointer hover:border-primary-500 transition-colors"
              sx={{
                borderWidth: selectedPaymentMethodId === pm.stripe_payment_method_id ? 2 : 1,
                borderColor: selectedPaymentMethodId === pm.stripe_payment_method_id ? "#906bae" : 
                            expired ? "#ef4444" : undefined,
                opacity: isDisabled ? 0.6 : 1,
                mb: 1,
              }}
              onClick={() => !isDisabled && onPaymentMethodChange(pm.stripe_payment_method_id)}
            >
              <CardContent className="!py-3 !px-4">
                <div className="flex items-center gap-3 w-full">
                  {pm.type === "link" ? (
                    <LinkIcon sx={{ fontSize: 28, color: expired ? "#ef4444" : "#1976d2" }} />
                  ) : (
                    <CreditCardIcon sx={{ fontSize: 28, color: expired ? "#ef4444" : "#1976d2" }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-sm ${expired ? 'line-through text-red-500' : ''}`}>
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
                            fontSize: "0.65rem",
                            height: 20,
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
                            fontSize: "0.65rem",
                            height: 20,
                          }}
                        />
                      )}
                    </div>
                    {pm.type === "card" && (pm.exp_month || pm.metadata?.exp_month) && (
                      <span className={`text-xs ${expired ? 'text-red-500' : 'text-content-500'}`}>
                        {t("paymentMethods.expires")} {pm.exp_month || pm.metadata?.exp_month}/
                        {pm.exp_year || pm.metadata?.exp_year}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Load more / show less toggle */}
        {hasSavedMethods && (hasMore || showAll) && (
          <Button
            variant="text"
            size="small"
            onClick={() => setShowAll((prev) => !prev)}
            startIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ mb: 1, textTransform: "none", color: "text.secondary", alignSelf: "flex-start", pl: 1 }}
          >
            {showAll
              ? t("payment.showLessCards", "Show fewer cards")
              : `${t("payment.loadMoreCards", "Load more")} (+${hiddenCount})`}
          </Button>
        )}

        {/* Add new card option */}
        <Card
          variant="outlined"
          className="!rounded-xl cursor-pointer hover:border-primary-500 transition-colors"
          sx={{
            borderWidth: selectedPaymentMethodId === "new_card" ? 2 : 1,
            borderColor: selectedPaymentMethodId === "new_card" ? "#906bae" : undefined,
          }}
          onClick={() => onPaymentMethodChange("new_card")}
        >
          <CardContent className="!py-3 !px-4">
            <div className="flex items-center gap-3">
              <AddCardIcon sx={{ fontSize: 28, color: "#1976d2" }} />
              <span className="font-semibold text-sm">
                {hasSavedMethods ? t("payment.addNewCard") : t("payment.payWithCard")}
              </span>
            </div>
          </CardContent>
        </Card>
    </div>
  );
};

export default SavedPaymentMethodSelector;
