//UTILITIES
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
//COMPONENTS
import { Card, CardContent, Chip } from "@mui/material";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

const CashbackInfoCard = () => {
  const { t } = useTranslation();
  const [cashbackConfig, setCashbackConfig] = useState({
    threshold: 5,
    percentage: 10,
  });

  useEffect(() => {
    // Get cashback configuration from sessionStorage (set by currencyReducer)
    try {
      const configurations = sessionStorage.getItem("configurations");
      if (configurations) {
        const configObj = JSON.parse(configurations);
        const threshold = parseInt(configObj.CASHBACK_ORDERS_THRESHOLD || "5");
        const percentage = parseFloat(configObj.CASHBACK_PERCENTAGE || "10");
        
        setCashbackConfig({
          threshold,
          percentage,
        });
      }
    } catch (error) {
      console.error("Error loading cashback configuration:", error);
      // Keep default values
    }
  }, []);

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-600/10 rounded-full">
              <CardGiftcardIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {t("wallet.cashbackRewards")}
              </h3>
            </div>
          </div>
          <Chip
            icon={<LocalOfferIcon fontSize="small" />}
            label={`${cashbackConfig.percentage}%`}
            color="secondary"
            className="bg-purple-600 text-white font-bold"
          />
        </div>

        <p className="text-gray-700 text-sm leading-relaxed mb-4 flex-grow">
          {t("wallet.cashbackDescription", {
            threshold: cashbackConfig.threshold,
            percentage: cashbackConfig.percentage,
          })}
        </p>

        <div className="pt-4 border-t border-purple-300 mt-auto">
          <p className="text-xs text-gray-600 text-center">
            {t("wallet.cashbackNote")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashbackInfoCard;
