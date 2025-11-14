//UTILITIES
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SwiperSlide } from "swiper/react";
import { useTranslation } from "react-i18next";
//COMPONENT
import { ConnectSVG } from "../assets/icons/Home";
import {
  CustomToggleButton,
  CustomToggleGroup,
} from "../assets/CustomComponents";
import AppleIcon from "@mui/icons-material/Apple";
import AdbIcon from "@mui/icons-material/Adb";
import { androidSteps, iOSSteps } from "../core/variables/StaticVariables";
import SwiperComponent from "../components/shared/swiper-component/SwiperComponent";
import useQueryParams from "../core/custom-hook/useQueryParams";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useSelector } from "react-redux";

const HowItWorks = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    device: searchParams.get("device") || "iOS",
  });
  const swiperRef = useRef(null);

  const deviceSlides = useMemo(() => {
    return filters?.device === "iOS" ? iOSSteps : androidSteps;
  }, [filters]);

  const handleQueryParams = useQueryParams(filters);

  useEffect(() => {
    handleQueryParams();
  }, [filters]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="max-w-xxl mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex flex-col gap-[2rem]">
        <div className="flex justify-center items-end">
          <ConnectSVG flip={localStorage.getItem("i18nextLng") === "ar"} />
          <p className={"font-semibold text-content-600 text-lg"}>
            {t("howItWorks.easyAndFast")}
          </p>
        </div>
        <h1 className="text-5xl font-bold text-center">
          {t("howItWorks.howToSetUpEsim")}
        </h1>

        {/* Platform Selection */}
        <div className={"flex justify-center"}>
          <CustomToggleGroup
            color="primary"
            value={filters?.device}
            onChange={(e) => {
              setFilters({ device: e.target.value });
              swiperRef.current.swiper.slideTo(0);
            }}
          >
            <CustomToggleButton value={"iOS"}>
              <AppleIcon fontSize="small" /> iOS
            </CustomToggleButton>
            <CustomToggleButton value="Android">
              <AdbIcon fontSize="small" />
              Android
            </CustomToggleButton>
          </CustomToggleGroup>
        </div>
        <div className="w-full sm:max-w-4xl mx-auto bg-primary-50 rounded-[100px] p-8 shadown-sm">
          <SwiperComponent
            swiperRef={swiperRef}
            key={localStorage.getItem("i18nextLng")}
          >
            {deviceSlides?.map((element, index) => (
              <SwiperSlide key={index} className={"flex justify-center"}>
                <div className="w-[250px] flex flex-col gap-6 items-center justify-center w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                  <div className="w-[250px] object-cover">
                    <LazyLoadImage
                      className="w-full h-auto"
                      alt={element?.description}
                      height={300}
                      src={`/images/${filters?.device?.toLowerCase()}Steps/step${
                        index + 1
                      }.png`}
                      loading="lazy"
                      width={250}
                    />
                  </div>
                  <p className="w-[250px] bg-white shadow-sm rounded px-12 py-2 font-bold text-lg text-center">
                    {`${t("howItWorks.step")} ${index + 1} ${t("howItWorks.of")} ${deviceSlides?.length}`}
                  </p>
                  <p className="text-center text-lg">
                    {t(`userGuide.${element?.description}`)}
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </SwiperComponent>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
