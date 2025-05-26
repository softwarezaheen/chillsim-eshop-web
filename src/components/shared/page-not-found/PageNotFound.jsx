import React from "react";
import { PageNotFoundSVG } from "../../../assets/icons/Home";
import { SuccessfulPaymentSVG } from "../../../assets/icons/Payment";
import { useTranslation } from "react-i18next";

const PageNotFound = () => {
  const { t } = useTranslation();

  return (
    <div
      className={
        "flex flex-col gap-4 w-full max-w-xxl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 items-center justify-center text-center"
      }
    >
      <PageNotFoundSVG />
      <h1>{t("common.pageNotFound")}</h1>
      <p>{t("common.pageNotExistMessage")}</p>
    </div>
  );
};

export default PageNotFound;
