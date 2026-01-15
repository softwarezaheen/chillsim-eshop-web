//UTILITIES
import React from "react";
import { useTranslation } from "react-i18next";
//MUI
import { Paper } from "@mui/material";
//ICONS
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";

const HowItWorksSection = () => {
  const { t } = useTranslation();

  const steps = [
    {
      icon: <SearchIcon className="text-primary" sx={{ fontSize: 40 }} />,
      step: "01",
      title: t("home.howItWorks.step1.title"),
      description: t("home.howItWorks.step1.description"),
    },
    {
      icon: <ShoppingCartIcon className="text-primary" sx={{ fontSize: 40 }} />,
      step: "02",
      title: t("home.howItWorks.step2.title"),
      description: t("home.howItWorks.step2.description"),
    },
    {
      icon: <QrCodeScannerIcon className="text-primary" sx={{ fontSize: 40 }} />,
      step: "03",
      title: t("home.howItWorks.step3.title"),
      description: t("home.howItWorks.step3.description"),
    },
    {
      icon: <FlightTakeoffIcon className="text-primary" sx={{ fontSize: 40 }} />,
      step: "04",
      title: t("home.howItWorks.step4.title"),
      description: t("home.howItWorks.step4.description"),
    },
  ];

  return (
    <section className="py-12 md:py-16 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            {t("home.howItWorks.title")}
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            {t("home.howItWorks.subtitle")}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Paper
              key={index}
              elevation={0}
              className="p-6 rounded-xl text-center border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Step number */}
              <div className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary font-bold text-sm mb-4">
                {step.step}
              </div>

              {/* Icon */}
              <div className="flex justify-center mb-4">{step.icon}</div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600">{step.description}</p>
            </Paper>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
