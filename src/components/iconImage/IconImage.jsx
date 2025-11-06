import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";

const IconImage = ({ handleLogoClick, isHomePage, showMenu }) => {
  return (
    <button onClick={handleLogoClick} className="flex items-center">
      <LazyLoadImage
        alt={import.meta.env.VITE_APP_PROJECT_TITLE}
        src={
          !isHomePage || showMenu ? "/logo/logo.png" : "/logo/logo.png"
        }
        width={150}
        height={32}
      />
    </button>
  );
};

export default IconImage;
