import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
//COMPONENT
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { useSelector } from "react-redux";
import { authMenuItems, menuItems, menuItemsSigned } from "../../core/variables/StaticVariables";
import Container from "../Container";
import i18n from "../../i18n.js";
import LanguageSwitcher from "../LanguageSwitcher.jsx";
import NotificationsMenu from "../NotificationsMenu";
import UserMenu from "../UserMenu";
import DrawerMenu from "../drawer/DrawerMenu";
import IconImage from "../iconImage/IconImage";

const Navbar = ({ main }) => {
  const { isAuthenticated } = useSelector((state) => state.authentication);
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
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

  const customClassName = useMemo(() => {
    if (!isHomePage || showMenu) {
      return "text-primary hover:text-secondary";
    } else {
      return "text-white hover:text-secondary";
    }
  }, [isHomePage, showMenu]);

const menuLinks = useMemo(() => {
  let links = [];
  
  // Add Home link when not on home page
  if (!isHomePage) {
    links.push({ path: "/", label: "home" });
  }
  
  if (isAuthenticated) {
    // Show authenticated menu when logged in (full or guest checkout)
    links = [...links, ...menuItemsSigned, ...authMenuItems];
  } else {
    // Show public menu when not authenticated
    links = [...links, ...menuItems];
  }
  
  return links;
}, [isAuthenticated, isHomePage]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 align-senter ${
          !isHomePage || showMenu ? "bg-white shadow-sm" : "bg-transparent"
        }`}
      >
        <Container>
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <IconImage
                handleLogoClick={handleLogoClick}
                isHomePage={isHomePage}
                showMenu={showMenu}
              />
            </div>

            {/* Desktop Navigation */}
            <div
              className={`hidden lg:flex absolute left-1/2 transform -translate-x-1/2 items-center transition-opacity duration-300`}
            >
              {menuLinks?.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => window.scrollTo(0, 0)}
                 className={`px-4 py-2 text-base transition-colors flex items-center font-bold ${
                    isActive(item.path) ? "text-secondary" : customClassName
                  }`}
 
                >
                  {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                  {t(`nav.${item.label}`)}
                </Link>
              ))}
            </div>

            {/* Right Section - Desktop Only */}
            {isAuthenticated ? (
              <div className="hidden lg:flex items-center space-x-6">
                <div className="hidden sm:block">
                  <LanguageSwitcher isHomePage={isHomePage} showMenu={showMenu} />
                </div>

                <NotificationsMenu />
                <UserMenu />
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-4">
                <div className="hidden sm:block">
                  <LanguageSwitcher isHomePage={isHomePage} showMenu={showMenu} />
                </div>

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
              <LanguageSwitcher isHomePage={isHomePage} showMenu={showMenu} />
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
