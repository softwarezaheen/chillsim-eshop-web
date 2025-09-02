import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import Home from "../../pages/home/Home";
import HowItWorks from "../../pages/HowItWorks";
import AboutUs from "../../pages/AboutUs";
import ContactUs from "../../pages/ContactUs";
import SignIn from "../../pages/SignIn";
import Terms from "../../pages/Terms";
import Esim from "../../pages/my-esim/Esim";
import Orders from "../../pages/order/Orders";
import Checkout from "../../pages/checkout/Checkout";
import PageNotFound from "../../components/shared/page-not-found/PageNotFound";
import Plans from "../../pages/plans/Plans";
import PlansWrapper from "../../pages/plans/PlansWrapper";
import OrderDetails from "../../pages/order/detail/OrderDetails";
import MainLayout from "../../components/layout/MainLayout";
import AuthValidation from "../../pages/auth-validation/AuthValidation";
import Profile from "../../pages/profile/Profile";
import UserNotifications from "../../pages/user-notification/UserNotifications";
import EsimDetail from "../../pages/my-esim/esim-detail/EsimDetail";
import PrivacyPolicy from "../../pages/privacy-policy/PrivacyPolicy";
import TmpLogin from "../../components/tmp-login/TmpLogin";

export const useAppRoutes = () => {
  const login_type = useSelector((state) => state.currency?.login_type);

  return useMemo(
    () => [
      {
        path: "",
        element:
          import.meta.env.VITE_APP_HOME_VISIBLE === "true" ? (
            <Home />
          ) : (
            <PlansWrapper />
          ),
        layout:
          import.meta.env.VITE_APP_HOME_VISIBLE === "true"
            ? MainLayout
            : undefined,
        children:
          import.meta.env.VITE_APP_HOME_VISIBLE === "true"
            ? []
            : [
                {
                  path: "",
                  element: <Plans />,
                },
                { path: "land", element: <Plans /> },
              ],
      },
      {
        path: "/plans/land",
        element: <Plans />
      },
      { path: `/callback-google`, element: <AuthValidation /> },
      {
        path: "/how-it-works",
        element: <HowItWorks />,
      },

      {
        path: "/tmp-login",
        element: <TmpLogin />,
      },

      {
        path: "/about-us",
        element: <AboutUs />,
      },
      {
        path: "/contact-us",
        element: <ContactUs />,
      },
      {
        path: "/terms",
        element: <Terms />,
      },
      {
        path: "/privacy",
        element: <PrivacyPolicy />,
      },
      {
        path: "/signin",
        element: <SignIn />,
        isAuthRestricted: true,
      },
      {
        path: "/checkout/:id",
        element: <Checkout />,
        isPrivate: login_type == "phone",
      },
      {
        path: "/checkout/:id/:iccid",
        element: <Checkout topup={true} />,
        isPrivate: login_type == "phone",
      },
      {
        path: "/user-notifications",
        element: <UserNotifications />,
        isPrivate: true,
      },

      {
        path: "*",
        element: <PageNotFound />,
      },

      { path: "/esim", element: <Esim />, isPrivate: true },
      { path: "/esim/:iccid", element: <EsimDetail />, isPrivate: true },
      { path: "/orders", element: <Orders />, isPrivate: true },
      {
        path: "/order/:id",
        element: <OrderDetails />,
        isPrivate: true,
      },
      {
        path: "/profile",
        element: <Profile />,
        isPrivate: true,
      },
    ],
    [login_type]
  );
};
