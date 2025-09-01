import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import clsx from "clsx";
import { useDispatch } from "react-redux";
import { setDirection } from "../redux/reducers/directionSlice.jsx";
import { queryClient } from "../main.jsx";

const LanguageSwitcher = () => {
  const [openModal, setOpenModal] = useState(false);
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const languages = [
    { code: "en", name: "English", flag: "EN" },
    { code: "ro", name: "Română", flag: "RO" },
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

  return (
    <div
      ref={modalRef}
      className={`relative group`}
      style={{ margin: "0 10px" }}
    >
      <button
        onClick={() => setOpenModal(!openModal)}
        className="bg-white rounded p-1 flex items-center space-x-1 text-base font-medium"
      >
        {languages?.find((lang) => lang.code === i18n?.language)?.flag}
        <KeyboardArrowDownIcon fontSize="small" />
      </button>
      {openModal && (
        <div
          className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200`}
        >
          <div className="py-1">
            {languages?.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language?.code)}
                className={clsx(
                  `w-full font-semibold text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2`,
                  {
                    "bg-gray-50 text-secondary":
                      i18n.language === language.code,
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
