//UTILITIES
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
//COMPONENTS
import { Button, Card, CardContent, Dialog, DialogContent, CircularProgress } from "@mui/material";
import WalletIcon from "@mui/icons-material/AccountBalanceWallet";

const WalletPayment = ({ bundle, orderDetail, recallAssign }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const { user_info } = useSelector((state) => state.authentication);
  const { system_currency, user_currency } = useSelector((state) => state.currency);

  // Extract balance from user info - same logic as WalletCard
  const balance = user_info?.balance || 
                  user_info?.wallet_balance || 
                  user_info?.account_balance || 
                  user_info?.available_balance || 
                  user_info?.credit_balance || 
                  0;
  
  // Get currency
  const sessionCurrency = sessionStorage?.getItem("user_currency");
  const currency = user_currency?.currency || 
                   sessionCurrency ||
                   user_info?.currency || 
                   user_info?.default_currency ||
                   system_currency || 
                   "USD";

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

  // Calculate if user has sufficient balance
  const bundlePrice = orderDetail?.original_amount 
    ? (orderDetail.original_amount / 100) / parseFloat((orderDetail.exchange_rate || 1).toFixed(2))
    : (bundle?.price || 0);
  const hasSufficientBalance = balance >= bundlePrice;

  const handleWalletPayment = async () => {
    if (!hasSufficientBalance) {
      toast.error(t("wallet.insufficientFundsMessage"));
      return;
    }
    
    console.log("Starting wallet payment, setting isProcessing to true");
    setIsProcessing(true);
    
    try {
      // Call the assign method for wallet payment
      // The PaymentFlow's assignMethod will handle the success flow automatically
      console.log("Calling recallAssign...");
      await recallAssign();
      
      console.log("recallAssign completed successfully");
      // Don't set isProcessing to false here - let the success handler manage it
      // The success flow will navigate away, so the component will unmount
      
    } catch (error) {
      console.error("Wallet payment error:", error);
      toast.error(t("wallet.paymentFailed"));
      setIsProcessing(false); // Only set to false on error
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 w-full">
        <Card className={`border-2 ${hasSufficientBalance ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <WalletIcon className={`h-6 w-6 ${hasSufficientBalance ? 'text-green-600' : 'text-red-600'}`} />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t("payment.walletBalance", { balance: formatCurrency(balance, currency) })}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("payment.bundlePrice")}: {formatCurrency(bundlePrice, currency)}
                  </p>
                </div>
              </div>
            </div>

            {!hasSufficientBalance && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
                <p className="text-red-700 text-sm font-medium">
                  {t("wallet.insufficientFundsMessage")}
                </p>
              </div>
            )}

            <Button
              fullWidth
              variant="contained"
              color={hasSufficientBalance ? "primary" : "error"}
              onClick={handleWalletPayment}
              disabled={!hasSufficientBalance || isProcessing}
              startIcon={<WalletIcon />}
            >
              {isProcessing 
                ? t("common.processing", "Processing...")
                : hasSufficientBalance 
                  ? t("wallet.payNowWithAmount", { amount: formatCurrency(bundlePrice, currency) })
                  : t("wallet.insufficientFunds")
              }
            </Button>

            {hasSufficientBalance && (
              <p className="text-sm text-gray-600 text-center mt-2">
                {t("wallet.noFeesOrTaxes")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Processing Modal */}
      {isProcessing && (
        <Dialog 
          open={isProcessing} 
          fullWidth 
          maxWidth="sm"
          disableEscapeKeyDown
          onClose={() => {}} // Prevent closing during processing
        >
          <DialogContent className="flex flex-col items-center justify-center gap-6 text-center py-12">
            <div className="relative">
              <WalletIcon className="h-16 w-16 text-primary-600 mb-4" />
              <CircularProgress 
                size={80} 
                className="absolute top-0 left-0 text-primary-600"
                thickness={2}
              />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold text-gray-800">
                {t("wallet.processingPayment", "Processing Wallet Payment")}
              </h2>
              <p className="text-gray-600">
                {t("wallet.processingMessage", "Please wait while we process your wallet payment...")}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {t("wallet.amountBeingCharged", "Amount: {{amount}}", { amount: formatCurrency(bundlePrice, currency) })}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Debug: Show processing state */}
      {console.log("WalletPayment render - isProcessing:", isProcessing)}
    </>
  );
};

export default WalletPayment;
