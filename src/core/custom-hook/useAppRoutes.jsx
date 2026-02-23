import React, { useMemo, lazy, Suspense } from "react";
import { useSelector } from "react-redux";
import MainLayout from "../../components/layout/MainLayout";
import PageNotFound from "../../components/shared/page-not-found/PageNotFound";

// Lazy load pages for code splitting
const Home = lazy(() => import("../../pages/home/Home"));
const HowItWorks = lazy(() => import("../../pages/HowItWorks"));
const AboutUs = lazy(() => import("../../pages/AboutUs"));
const ContactUs = lazy(() => import("../../pages/ContactUs"));
const SignIn = lazy(() => import("../../pages/SignIn"));
const Terms = lazy(() => import("../../pages/Terms"));
const Esim = lazy(() => import("../../pages/my-esim/Esim"));
const Orders = lazy(() => import("../../pages/order/Orders"));
const Checkout = lazy(() => import("../../pages/checkout/Checkout"));
const Plans = lazy(() => import("../../pages/plans/Plans"));
const PlansWrapper = lazy(() => import("../../pages/plans/PlansWrapper"));
const OrderDetails = lazy(() => import("../../pages/order/detail/OrderDetails"));
const AuthValidation = lazy(() => import("../../pages/auth-validation/AuthValidation"));
const Profile = lazy(() => import("../../pages/profile/Profile"));
const UserNotifications = lazy(() => import("../../pages/user-notification/UserNotifications"));
const EsimDetail = lazy(() => import("../../pages/my-esim/esim-detail/EsimDetail"));
const PrivacyPolicy = lazy(() => import("../../pages/privacy-policy/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("../../pages/CookiePolicy"));
const Invoice = lazy(() => import("../../pages/Invoice"));
const TmpLogin = lazy(() => import("../../components/tmp-login/TmpLogin"));
const DownloadRedirect = lazy(() => import("../../components/download/DownloadRedirect"));
const BillingPage = lazy(() => import("../../pages/billing/BillingPage"));
const Wallet = lazy(() => import("../../pages/wallet/Wallet"));
const ReferralProgram = lazy(() => import("../../pages/referral/ReferralProgram"));
const ReferralLanding = lazy(() => import("../../pages/referral/ReferralLanding"));
const Benefits = lazy(() => import("../../pages/benefits/Benefits"));
const RegionLanding = lazy(() => import("../../pages/landing/RegionLanding"));
const StudentBeansPage = lazy(() => import("../../pages/partners/StudentBeansPage"));
const StudentDiscounts = lazy(() => import("../../pages/StudentDiscounts"));
const PaymentMethods = lazy(() => import("../../pages/payment-methods/PaymentMethods"));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
  </div>
);

// Wrapper to add Suspense to lazy loaded components
const withSuspense = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

export const useAppRoutes = () => {
  const login_type = useSelector((state) => state.currency?.login_type);

  const routes = useMemo(
    () => [
      {
        path: "",
        element:
          import.meta.env.VITE_APP_HOME_VISIBLE === "true" ? (
            withSuspense(Home)
          ) : (
            withSuspense(PlansWrapper)
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
                  element: withSuspense(Plans),
                },
                { path: "land", element: withSuspense(Plans) },
              ],
      },
      {
        path: "/plans/land",
        element: withSuspense(PlansWrapper),
        children: [
          {
            path: "",
            element: withSuspense(Plans),
          },
        ],
      },
      { path: `/callback-google`, element: withSuspense(AuthValidation) },
      { path: `/auth-verify`, element: withSuspense(AuthValidation) },
      {
        path: "/studentbeans",
        element: withSuspense(StudentBeansPage),
        layout: MainLayout,
      },
      {
        path: "/how-it-works",
        element: withSuspense(HowItWorks),
      },

      {
        path: "/tmp-login",
        element: withSuspense(TmpLogin),
      },

      {
        path: "/about-us",
        element: withSuspense(AboutUs),
      },
      {
        path: "/contact-us",
        element: withSuspense(ContactUs),
      },
      {
        path: "/benefits",
        element: withSuspense(Benefits),
      },
      {
        path: "/student-discounts",
        element: withSuspense(StudentDiscounts),
      },
      {
        path: "/esim-destination/:type",
        element: withSuspense(RegionLanding),
      },
      {
        path: "/terms",
        element: withSuspense(Terms),
      },
      {
        path: "/privacy",
        element: withSuspense(PrivacyPolicy),
      },
      {
        path: "/cookies-policy",
        element: withSuspense(CookiePolicy),
      },
      {
        path: "/invoice/:invoiceId",
        element: withSuspense(Invoice),
        isPrivate: true,
      },
      {
        path: "/download",
        element: withSuspense(DownloadRedirect),
      },
      {
        path: "/signin",
        element: withSuspense(SignIn),
        isAuthRestricted: true,
      },
      {
        path: "/billing",
        element: withSuspense(BillingPage),
        isPrivate: true,
      },
      {
        path: "/checkout/:id",
        element: withSuspense(Checkout),
        isPrivate: login_type == "phone",
      },
      {
        path: "/checkout/:id/:iccid",
        element: <Suspense fallback={<PageLoader />}><Checkout topup={true} /></Suspense>,
        isPrivate: login_type == "phone",
      },
      {
        path: "/user-notifications",
        element: withSuspense(UserNotifications),
        isPrivate: true,
      },

      { path: "/esim", element: withSuspense(Esim), isPrivate: true },
      { path: "/esim/:iccid", element: withSuspense(EsimDetail), isPrivate: true },
      { path: "/orders", element: withSuspense(Orders), isPrivate: true },
      {
        path: "/order/:id",
        element: withSuspense(OrderDetails),
        isPrivate: true,
      },
      {
        path: "/profile",
        element: withSuspense(Profile),
        isPrivate: true,
      },
      {
        path: "/wallet",
        element: withSuspense(Wallet),
        isPrivate: true,
      },
      {
        path: "/payment-methods",
        element: withSuspense(PaymentMethods),
        isPrivate: true,
      },
      {
        path: "/referral",
        element: withSuspense(ReferralLanding),
      },
      {
        path: "/referral-program",
        element: withSuspense(ReferralProgram),
        isPrivate: true,
      },

      {
        path: "*",
        element: <PageNotFound />,
      },
    ],
    [login_type]
  );

  return routes;
};
