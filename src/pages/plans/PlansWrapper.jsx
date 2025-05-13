import React from "react";
import { Outlet } from "react-router-dom";

const PlansWrapper = () => {
  return (
    <div className="pb-12">
      <div className="max-w-xxl mx-auto  sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose your plan</h1>
          <p>
            Please{" "}
            <span className="font-mono text-lg font-bold text-primary">
              dial *#06#
            </span>{" "}
            to check device compatibility, if EID exist then
            <br />
            your device is compatible
          </p>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default PlansWrapper;
