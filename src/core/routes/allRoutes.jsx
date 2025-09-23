import React from "react";
import Home from "../../pages/home/Home";
import HowItWorks from "../../pages/HowItWorks";
import AboutUs from "../../pages/AboutUs";
import ContactUs from "../../pages/ContactUs";
import SignIn from "../../pages/SignIn";
import Terms from "../../pages/Terms";
import Esim from "../../pages/my-esim/Esim";
import Orders from "../../pages/order/Orders";
import DownloadTheme from "../../pages/DownloadTheme";
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

export const allRoutes = [
  {
    path: "",
    element:
      import.meta.env.VITE_APP_HOME_VISIBLE === "true" ? (
        <Home />
      ) : (
        <PlansWrapper />
      ),
    layout:
      import.meta.env.VITE_APP_HOME_VISIBLE === "true" ? MainLayout : undefined,
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
    path: "/plans",
    element: <PlansWrapper />,
    children: [
      {
        path: "",
        element: <Plans />,
      },
      { path: "land", element: <Plans /> },
    ],
  },
  { path: `/callback-google`, element: <AuthValidation /> },
  { path: `/auth-verify`, element: <AuthValidation /> },
  {
    path: "/how-it-works",
    element: <HowItWorks />,
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
    path: "/download-theme",
    element: <DownloadTheme />,
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
  },
  {
    path: "/checkout/:id/:iccid",
    element: <Checkout topup={true} />,
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
];
