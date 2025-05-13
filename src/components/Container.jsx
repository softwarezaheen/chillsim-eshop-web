import React from "react";

const Container = ({ children, className = "" }) => {
  return (
    <div className={`w-[90%] max-w-xxl mx-auto ${className}`}>{children}</div>
  );
};

export default Container;
