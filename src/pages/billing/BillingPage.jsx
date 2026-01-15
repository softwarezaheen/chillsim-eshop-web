import React, { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { CircularProgress } from "@mui/material";

const BillingFormView = lazy(() => import("../../components/billing-info").then(module => ({ default: module.BillingFormView })));

const BillingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 w-full max-w-xxl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
      {/* Back Button */}
      <div
        className="flex flex-row gap-2 items-center font-semibold cursor-pointer"
        onClick={() => navigate(-1)}
      >
        <ArrowBackIosNewIcon
          sx={
            localStorage.getItem("i18nextLng") === "ar"
              ? { transform: "scale(-1,1)" }
              : {}
          }
          color="primary"
          fontSize="small"
        />
        {t("checkout.goBack")}
      </div>

      {/* Billing Form */}
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <CircularProgress />
        </div>
      }>
      <div className="flex flex-col items-start gap-4 w-full">
        <BillingFormView 
          showHeader={true}
          submitButtonText={t("btn.continueToCheckout")}
        />
      </div>
      </Suspense>
    </div>
  );
};

export default BillingPage;