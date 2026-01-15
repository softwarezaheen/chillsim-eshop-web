//UTILITIES
import React from "react";
//COMPONENTS
import HomePageTemplate from "../../components/home/HomePageTemplate";

// StudentBeans logo - stored locally
const STUDENTBEANS_LOGO = "/images/partners/studentbeans-logo.svg";

/**
 * StudentBeansPage - Partner landing page for StudentBeans partnership
 * Shows "Recommended by StudentBeans" badge above the hero title
 */
const StudentBeansPage = () => {
  return (
    <HomePageTemplate
      partnerName="StudentBeans"
      partnerLogo={STUDENTBEANS_LOGO}
      recommendedByText="Recommended by"
      partnerBadgeStyle="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full shadow-lg"
    />
  );
};

export default StudentBeansPage;
