//UTILITIES
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
//COMPONENT
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { StyledDrawer } from "../../assets/CustomComponents";
import { Close } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import {
  authResponsiveMenuItems,
  menuItems,
} from "../../core/variables/StaticVariables";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import clsx from "clsx";
import { useAuth } from "../../core/context/AuthContext";

const DrawerMenu = ({ toggleMenu, setToggleMenu }) => {
  const { t } = useTranslation();
  const { handleLogout } = useAuth();
  const { isAuthenticated } = useSelector((state) => state.authentication);

  const isActive = (path) => location.pathname === path;

  const menuElements = useMemo(() => {
    return isAuthenticated
      ? authResponsiveMenuItems.concat(menuItems)
      : menuItems;
  }, [isAuthenticated]);

  return (
    <StyledDrawer
      open={toggleMenu}
      className={clsx("lg:hidden", {
        hidden: !toggleMenu,
      })}
      onClose={() => setToggleMenu(false)}
      anchor={"right"}
    >
      <IconButton
        color="primary"
        onClick={() => setToggleMenu(false)}
        sx={{
          display: "flex",
          flexFlow: "row nowrap",
          justifyContent: "flex-end",
        }}
      >
        <Close />
      </IconButton>

      {menuElements.map((item) => (
        <Link
          key={item.path}
          onClick={() => {
            window.scrollTo(0, 0);
            setToggleMenu(false);
          }}
          to={item.path}
          className={`text-sm font-medium transition-colors flex  flex-row justify-between items-center ${
            isActive(item.path)
              ? "text-secondary"
              : "text-primary hover:text-secondary"
          }`}
        >
          {t(`nav.${item?.label}`)}
          <ArrowForwardIosIcon fontSize="small" />
        </Link>
      ))}
      <div className="my-2 border-t border-gray-100" />
      {isAuthenticated ? (
        <div className={"flex flex-col items-center justify-center"}>
          <button
            className="w-full flex items-center space-x-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => {
              handleLogout();
            }}
          >
            <LogoutOutlinedIcon className={"text-red-600"} />
            <span className="text-red-600 font-semibold">
              {t("nav.logout")}
            </span>
          </button>
        </div>
      ) : (
        <Button
          onClick={() => setToggleMenu(false)}
          color="primary"
          variant={"contained"}
          component={Link}
          to={"/signin"}
        >
          {t("nav.signIn")}
        </Button>
      )}
    </StyledDrawer>
  );
};

export default DrawerMenu;
