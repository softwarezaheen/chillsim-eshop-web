//UTILITIES
import React from "react";
import clsx from "clsx";
//COMPONENT
import Footer from "./Footer";
import Navbar from "./Navbar";

const AuthLayout = ({ children, isPublic }) => {
  return (
    <>
      <Navbar />
      <main
        className={clsx("bg-gray-50 flex-1", {
          "!bg-white": isPublic,
        })}
      >
        <div className={"w-[90%] max-w-xxl mx-auto py-8"}>{children}</div>
      </main>
      <Footer />
    </>
  );
};

export default AuthLayout;
