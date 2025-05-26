//UTILTIIES
import React, { useCallback, useEffect, useState } from "react";
import { Swiper } from "swiper/react";
import clsx from "clsx";
import { Navigation, Pagination } from "swiper/modules";
//COMPONENT
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useSelector } from "react-redux";

const SwiperComponent = ({ slidesPerView, children, swiperRef }) => {
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const handlePrev = useCallback(() => {
    if (!swiperRef.current) return;
    swiperRef.current.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!swiperRef.current) return;
    swiperRef.current.swiper.slideNext();
  }, []);

  useEffect(() => {
    if (!swiperRef.current) return;

    const swiperInstance = swiperRef.current.swiper;

    const handleSlideChange = () => {
      setIsBeginning(swiperInstance.isBeginning);
      setIsEnd(swiperInstance.isEnd);
    };

    swiperInstance.on("slideChange", handleSlideChange);
    handleSlideChange();

    return () => {
      swiperInstance.off("slideChange", handleSlideChange);
    };
  }, []);

  return (
    <div className={"relative"}>
      <Swiper
        spaceBetween={20}
        modules={[Pagination, Navigation]}
        ref={swiperRef}
        pagination={{ clickable: true }}
        slidesPerView={slidesPerView}
      >
        {children}
      </Swiper>
      <>
        <div className={`absolute cursor-pointer top-0 h-full z-[1] left-0`}>
          <div
            className={"flex items-center h-[100%]"}
            onClick={() => {
              if (localStorage.getItem("i18nextLng") === "ar") {
                if (!isEnd) {
                  handleNext();
                }
              } else {
                if (!isBeginning) {
                  handlePrev();
                }
              }
            }}
          >
            <ArrowBackIosIcon
              color={"primary"}
              className={clsx({
                "opacity-50 cursor-default":
                  localStorage.getItem("i18nextLng") === "ar"
                    ? isEnd
                    : isBeginning,
              })}
            />
          </div>
        </div>
        <div className={`absolute cursor-pointer top-0 h-full z-[1] right-0`}>
          <div
            className={"flex items-center h-[100%]"}
            onClick={() => {
              if (localStorage.getItem("i18nextLng") === "ar") {
                if (!isBeginning) {
                  handlePrev();
                }
              } else {
                if (!isEnd) {
                  handleNext();
                }
              }
            }}
          >
            <ArrowForwardIosIcon
              color="primary"
              className={clsx({
                "opacity-50 cursor-default":
                  localStorage.getItem("i18nextLng") === "ar"
                    ? isBeginning
                    : isEnd,
              })}
            />
          </div>
        </div>
      </>
    </div>
  );
};

export default SwiperComponent;
