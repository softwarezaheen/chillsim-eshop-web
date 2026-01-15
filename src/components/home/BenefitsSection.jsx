//UTILITIES
import React from "react";
import { useTranslation } from "react-i18next";
//MUI
import { Paper } from "@mui/material";
//ICONS
import PublicIcon from "@mui/icons-material/Public";
import SavingsIcon from "@mui/icons-material/Savings";
import SpeedIcon from "@mui/icons-material/Speed";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import SecurityIcon from "@mui/icons-material/Security";

const BenefitsSection = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: <PublicIcon className="text-primary" sx={{ fontSize: 36 }} />,
      title: t("home.benefits.global.title"),
      description: t("home.benefits.global.description"),
    },
    {
      icon: <SavingsIcon className="text-primary" sx={{ fontSize: 36 }} />,
      title: t("home.benefits.savings.title"),
      description: t("home.benefits.savings.description"),
    },
    {
      icon: <SpeedIcon className="text-primary" sx={{ fontSize: 36 }} />,
      title: t("home.benefits.instant.title"),
      description: t("home.benefits.instant.description"),
    },
    {
      icon: <PhoneAndroidIcon className="text-primary" sx={{ fontSize: 36 }} />,
      title: t("home.benefits.easy.title"),
      description: t("home.benefits.easy.description"),
    },
    {
      icon: <SecurityIcon className="text-primary" sx={{ fontSize: 36 }} />,
      title: t("home.benefits.secure.title"),
      description: t("home.benefits.secure.description"),
    },
    {
      icon: <SupportAgentIcon className="text-primary" sx={{ fontSize: 36 }} />,
      title: t("home.benefits.support.title"),
      description: t("home.benefits.support.description"),
    },
  ];

  return (
    <section className="py-12 md:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            {t("home.benefits.title")}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("home.benefits.subtitle")}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <Paper
              key={index}
              elevation={0}
              className="p-6 rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all"
            >
              {/* Icon */}
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                {benefit.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {benefit.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </Paper>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
