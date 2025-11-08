import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import clsx from "clsx";
import { useDispatch } from "react-redux";
import { setDirection } from "../redux/reducers/directionSlice.jsx";
import { queryClient } from "../main.jsx";

const LanguageSwitcher = ({ isHomePage, showMenu }) => {
  const [openModal, setOpenModal] = useState(false);
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const languages = [
    { code: "en", name: "English", flag: "EN" },
    { code: "ro", name: "Română", flag: "RO" },
    { code: "es", name: "Español", flag: "ES" },
    { code: "fr", name: "Français", flag: "FR" },
    { code: "de", name: "Deutsch", flag: "DE" },
    { code: "hi", name: "हिंदी", flag: "HI" },
  ];
  const modalRef = useRef(null);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    const direction = "ltr";
    dispatch(setDirection(direction));
    localStorage.setItem("i18nextLng", lng); // Save selected language
    document.documentElement.dir = direction;
    setOpenModal(false);
    queryClient.invalidateQueries();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setOpenModal(false);
      }
    };

    if (openModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openModal]);

  // Determine button styling based on navbar state
  const buttonClassName = useMemo(() => {
    if (!isHomePage || showMenu) {
      return "text-primary hover:text-secondary bg-white border border-gray-200";
    } else {
      return "text-white hover:text-secondary bg-white/10 border border-white/20";
    }
  }, [isHomePage, showMenu]);

  return (
    <div
      ref={modalRef}
      className="relative"
    >
      <button
        onClick={() => setOpenModal(!openModal)}
        className={`rounded-md px-3 py-2 flex items-center space-x-1 text-sm font-medium transition-colors ${buttonClassName}`}
      >
        {languages?.find((lang) => lang.code === i18n?.language)?.flag}
        <KeyboardArrowDownIcon fontSize="small" />
      </button>
      {openModal && (
        <div
          className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
        >
          <div className="py-1">
            {languages?.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language?.code)}
                className={clsx(
                  "w-full font-medium text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center transition-colors",
                  {
                    "bg-gray-50 text-secondary":
                      i18n.language === language.code,
                    "text-gray-700": i18n.language !== language.code,
                  },
                )}
              >
                <span>{language?.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
