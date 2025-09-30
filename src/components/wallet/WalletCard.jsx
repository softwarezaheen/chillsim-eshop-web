//UTILITIES
import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
//COMPONENTS
import { Card, CardContent } from "@mui/material";
import WalletIcon from "@mui/icons-material/AccountBalanceWallet";

const WalletCard = ({ userInfo }) => {
  const { t } = useTranslation();
  const { system_currency, user_currency } = useSelector((state) => state.currency);

  // Extract balance from user info
  const balance = userInfo?.balance || 
                  userInfo?.wallet_balance || 
                  userInfo?.account_balance || 
                  userInfo?.available_balance || 
                  userInfo?.credit_balance || 
                  0;
  
  // Priority: user's selected currency > sessionStorage currency > user's default currency > system currency
  const sessionCurrency = sessionStorage?.getItem("user_currency");
  const currency = user_currency?.currency || 
                   sessionCurrency ||
                   userInfo?.currency || 
                   userInfo?.default_currency ||
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
      // Fallback if currency is not recognized
      return `${amount.toFixed(2)} ${currencyCode}`;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <WalletIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {t("nav.myWallet")}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("wallet.currentBalance")}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center py-4">
          <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {formatCurrency(balance, currency)}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-300">
          <div className="flex justify-between items-center text-gray-600 text-sm">
            <span>{t("wallet.lastUpdated")}</span>
            <span>
              {new Date(userInfo?.updated_at || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletCard;