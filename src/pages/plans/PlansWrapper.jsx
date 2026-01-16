import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PopularDestinations from "../../components/popular-destinations/PopularDestinations";

const PlansWrapper = () => {
  const { t } = useTranslation();
  const location = useLocation();
  
  // Only show title and compatibility message on /plans/land
  const showHeader = location.pathname === "/plans/land";

  return (
    <div className="pb-12">
      <div className="max-w-xxl mx-auto sm:px-6 lg:px-8">
        {showHeader && (
          <div className="text-center mb-6 sm:mb-10">
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">
              {t("plans.chooseYourPlan")}
            </h1>
            {/* <p className="text-sm sm:text-base">
              {t("plans.please")} &nbsp;
              <span className="font-mono text-sm sm:text-lg font-bold text-primary">
                {t("plans.dial")} <span dir={"ltr"}>*#06#</span>
              </span>
              &nbsp; {t("plans.checkCompatibility")}
              {t("plans.compatibleDevice")}
            </p> */}
          </div>
        )}

        {/* Compact Popular Destinations for Plans page */}
        <PopularDestinations layout="compact" />

        <Outlet />
      </div>
    </div>
  );
};

export default PlansWrapper;
