//UTILITIES
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useQueryClient } from "react-query";
//COMPONENTS
import { Card, CardContent, Button, TextField } from "@mui/material";
import RedeemIcon from "@mui/icons-material/Redeem";
//API
import { redeemVoucher } from "../../core/apis/walletAPI";
//REDUCER
import { fetchUserInfo } from "../../redux/reducers/authReducer";

const VoucherCard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [voucherCode, setVoucherCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRedeemVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error(t("wallet.voucherCodeRequired"));
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await redeemVoucher({ code: voucherCode.trim() });
      
      // Success case - API returned 200/201
      toast.success(t("wallet.voucherRedeemedSuccessfully"));
      setVoucherCode(""); // Clear the input
      // Reload user info to get updated balance
      dispatch(fetchUserInfo());
      // Invalidate wallet transactions to refresh the list
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
    } catch (error) {
      console.error("Voucher redemption error:", error);
      
      // Handle different error cases
      let errorMessage = t("wallet.voucherRedemptionFailed");
      
      if (error?.status === 404 || error?.code === "ERR_BAD_REQUEST") {
        // Invalid voucher code
        errorMessage = error?.message || t("wallet.invalidVoucherCode");
      } else if (error?.response?.data?.message) {
        // Other API errors with custom message
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        // Direct error message
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleRedeemVoucher();
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <RedeemIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {t("wallet.redeemVoucher")}
            </h3>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-6">
          {t("wallet.voucherExplanation")}
        </p>

        <div className="space-y-4">
          <TextField
            fullWidth
            placeholder={t("wallet.enterVoucherCode")}
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            variant="outlined"
            size="small"
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleRedeemVoucher}
            disabled={isLoading || !voucherCode.trim()}
            className="py-2"
          >
            {isLoading ? t("wallet.redeeming") : t("wallet.redeem")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoucherCard;