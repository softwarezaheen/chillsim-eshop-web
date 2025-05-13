import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import clsx from "clsx";

const MainLayout = ({ children, isAuthRestricted, restricted }) => {
  return (
    <>
      <Navbar main />
      <main
        className={clsx("flex-grow", {
          "bg-gray-50": isAuthRestricted,
        })}
      >
        {" "}
        <div
          className={clsx({ "w-[90%] max-w-xxl mx-auto py-8": !restricted })}
        >
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
