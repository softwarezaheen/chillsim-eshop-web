//UTILITIES
import React from "react";
import { useTranslation } from "react-i18next";
//MUI
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
//COMPONENTS
import { DownloadButton } from "../download/DownloadButton";

const DownloadAppSection = () => {
  const { t } = useTranslation();

  return (
    <section
      className="py-12 md:py-16 px-4 bg-primary/5"
      style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}
    >
      <div className="max-w-2xl mx-auto text-center">
        {/* App icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <PhoneAndroidIcon className="text-primary" sx={{ fontSize: 40 }} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
          {t("home.downloadApp.title")}
        </h2>

        {/* Subtitle */}
        <p className="text-gray-600 max-w-xl mx-auto mb-2">
          {t("home.downloadApp.subtitle")}
        </p>

        {/* Download CTA — smart redirect to App Store / Play Store / website */}
        <DownloadButton />
      </div>
    </section>
  );
};

export default DownloadAppSection;
