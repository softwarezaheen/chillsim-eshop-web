//UTILITIES
import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
//COMPONENT
import BookOutlinedIcon from "@mui/icons-material/BookOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useClickOutside } from "../core/custom-hook/useClickOutside";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import SimCardOutlinedIcon from "@mui/icons-material/SimCardOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useAuth } from "../core/context/AuthContext";

const UserMenu = () => {
  const { t } = useTranslation();
  const profileRef = useRef(null);
  const { handleLogout } = useAuth();
  const { user_info } = useSelector((state) => state.authentication);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  useClickOutside(profileRef, () => setIsProfileOpen(false));

  const onClose = () => {
    setIsProfileOpen(false);
  };
  return (
    <div className="relative" ref={profileRef}>
      <button
        onClick={() => {
          setIsProfileOpen(!isProfileOpen);
        }}
        className="flex items-center space-x-2 bg-white  rounded p-1 text-gray-700 hover:text-gray-900"
      >
        <PersonOutlineIcon className="h-5 w-5" color="primary" />
      </button>

      {isProfileOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-4">
          <div className="mb-4 px-2">
            <p className="text-sm truncate font-semibold">{user_info?.email}</p>
          </div>

          <div className="space-y-2">
            <Link
              to="/profile"
              className="flex items-center space-x-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={onClose}
            >
              <PermIdentityIcon color="primary" />

              <span className="font-semibold">{t("nav.accountInfo")}</span>
            </Link>
            <Link
              to="/esim"
              className="flex items-center space-x-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={onClose}
            >
              <SimCardOutlinedIcon color="primary" />
              <span className={"font-semibold"}>{t("nav.myEsim")}</span>
            </Link>
            <div className="my-2 border-t border-gray-100" />
            <Link
              to="/about-us"
              className="flex items-center space-x-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={onClose}
            >
              <InfoOutlinedIcon color="primary" />
              <span className={"font-semibold"}>{t("nav.aboutUs")}</span>
            </Link>
            <Link
              to="/how-it-works"
              className="flex items-center space-x-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={onClose}
            >
              <BookOutlinedIcon color="primary" />
              <span className={"font-semibold"}>{t("nav.howItWorks")}</span>
            </Link>

            <div className="my-2 border-t border-gray-100" />
            <button
              className="w-full flex items-center space-x-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => {
                handleLogout();
                onClose();
              }}
            >
              <LogoutOutlinedIcon className={"text-red-600"} />
              <span className="text-red-600 font-semibold">
                {t("nav.logout")}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
