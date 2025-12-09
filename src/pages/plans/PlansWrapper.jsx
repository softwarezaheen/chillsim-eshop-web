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
      <div className="max-w-xxl mx-auto  sm:px-6 lg:px-8">
        {showHeader && (
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
        )}

        {/* Popular Destinations Section */}
        <PopularDestinations />

        <Outlet />
      </div>
    </div>
  );
};

export default PlansWrapper;
