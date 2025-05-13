import React from "react";
import { useTranslation } from "react-i18next";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import clsx from "clsx";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: "en", name: "English", flag: "EN" },
    { code: "ar", name: "العربية", flag: "AR" },
    { code: "fr", name: "Français", flag: "FR" },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    // localeStorage.setItem("lng", lng);
    // Set HTML dir attribute for RTL languages
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
  };

  return (
    <div className="relative group">
      <button className="bg-white rounded p-1 flex items-center space-x-1 text-base font-medium">
        {languages.find((lang) => lang.code === i18n.language)?.flag}
        <KeyboardArrowDownIcon fontSize="small" />
      </button>
      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="py-1">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={clsx(
                `w-full font-semibold text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2`,
                {
                  "bg-gray-50 text-secondary": i18n.language === language.code,
                }
              )}
            >
              <span>{language.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
