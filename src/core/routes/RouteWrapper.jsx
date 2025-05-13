import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import MainLayout from "../../components/layout/MainLayout";

const RouteWrapper = ({ layout, element, isPrivate, isAuthRestricted }) => {
  const { isAuthenticated } = useSelector((state) => state.authentication);

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next");

  if (isPrivate && !isAuthenticated) {
    return (
      <Navigate
        to={
          location?.pathname
            ? `/signin?next=${encodeURIComponent(location.pathname)}`
            : "signin"
        }
        replace
      />
    );
  } else if (isAuthRestricted && isAuthenticated) {
    return <Navigate to={next ? decodeURIComponent(next) : "/plans"} />;
  }

  const Layout = layout ? layout : isAuthenticated ? AuthLayout : MainLayout;

  return (
    <Layout
      isPublic={!isPrivate && !isAuthRestricted}
      isAuthRestricted={isAuthRestricted}
      restricted={layout}
    >
      {element}
    </Layout>
  );
};

export default RouteWrapper;
