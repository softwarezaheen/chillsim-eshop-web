import React from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PlansWrapper = () => {
  const { t } = useTranslation();

  return (
    <div className="pb-12">
      <div className="max-w-xxl mx-auto  sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {t("plans.chooseYourPlan")}
          </h1>
          <p>
            {t("plans.please")} &nbsp;
            <span className="font-mono text-lg font-bold text-primary">
              {t("plans.dial")} <span dir={"ltr"}>*#06#</span>
            </span>
            &nbsp; {t("plans.checkCompatibility")}
            <br />
            {t("plans.compatibleDevice")}
          </p>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default PlansWrapper;
