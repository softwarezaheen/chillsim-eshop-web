import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

//COMPONENT
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import Container from "../Container";
import DrawerMenu from "../drawer/DrawerMenu";
import { authMenuItems, menuItems } from "../../core/variables/StaticVariables";
import { useSelector } from "react-redux";
import UserMenu from "../UserMenu";
import NotificationsMenu from "../NotificationsMenu";
import { Drawer } from "@mui/material";
import {
  LazyLoadComponent,
  LazyLoadImage,
} from "react-lazy-load-image-component";

const Navbar = ({ main }) => {
  const { isAuthenticated } = useSelector((state) => state.authentication);
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [toggleMenu, setToggleMenu] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isActive = (path) => location.pathname === path;

  const isHomePage =
    import.meta.env.VITE_APP_HOME_VISIBLE === "true"
      ? location.pathname === "/"
      : false;

  const handleLogoClick = () => {
    navigate("/");
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (isHomePage) {
        if (currentScrollY > 100) {
          setShowMenu(true);
        } else {
          setShowMenu(false);
        }
      } else {
        setShowMenu(true);
      }

      setLastScrollY(currentScrollY);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY, isHomePage]);

  const menuLinks = useMemo(() => {
    if (main) return menuItems;
    else return authMenuItems;
  }, [main]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          !isHomePage || showMenu ? "bg-white shadow-sm" : "bg-transparent"
        }`}
      >
        <Container>
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <button onClick={handleLogoClick} className="flex items-center">
                <LazyLoadImage
                  alt={import.meta.env.VITE_APP_PROJECT_TITLE}
                  src={
                    !isHomePage || showMenu
                      ? "/logo/logo.png"
                      : "/logo/logo-white.png"
                  }
                  width={150}
                  height={32}
                />
              </button>
            </div>

            {/* Desktop Navigation */}
            <div
              className={`hidden lg:flex items-center justify-center flex-1 px-8 transition-opacity duration-300`}
            >
              {menuLinks?.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => window.scrollTo(0, 0)}
                  className={`px-4 py-2 text-base transition-colors flex items-center font-quicksandSemibold ${
                    isActive(item.path)
                      ? "text-secondary"
                      : !isHomePage || showMenu
                      ? "text-primary hover:text-secondary"
                      : "text-white hover:text-secondary"
                  }`}
                >
                  {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                  {t(`nav.${item.label}`)}
                </Link>
              ))}
            </div>

            {/* Right Section */}
            {isAuthenticated ? (
              <div className="hidden lg:flex flex items-center space-x-6">
                <NotificationsMenu />

                <UserMenu />
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-6">
                {location?.pathname !== "/signin" && (
                  <Link
                    to="/signin"
                    className="inline-flex items-center px-6 py-2.5 text-sm font-medium rounded text-white bg-primary hover:bg-primary/90 transition-colors"
                  >
                    {t("nav.signIn")}
                  </Link>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <div className="flex lg:hidden items-center space-x-4">
              {isAuthenticated && <NotificationsMenu />}
              <button
                onClick={() => setToggleMenu(!toggleMenu)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700"
              >
                {toggleMenu ? (
                  <DrawerMenu className="block h-6 w-6 bg-red" />
                ) : (
                  <MenuOutlinedIcon className="block h-6 w-6" color="primary" />
                )}
              </button>
            </div>
          </div>
        </Container>
      </nav>

      {toggleMenu && (
        <DrawerMenu toggleMenu={toggleMenu} setToggleMenu={setToggleMenu} />
      )}

      {!isHomePage && <div className="h-20"></div>}
    </>
  );
};

export default Navbar;
