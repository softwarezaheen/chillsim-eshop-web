import React from "react";
import { useQuery } from "react-query";
import { getAboutusContent } from "../core/apis/homeAPI";
import { Skeleton } from "@mui/material";
import NoDataFound from "../components/shared/no-data-found/NoDataFound";
import { ConnectSVG } from "../assets/icons/Home";
import { ContentSkeletons } from "../components/shared/skeletons/HomePageSkeletons";
import { NoContentSVG } from "../assets/icons/Common";
import EditorText from "../components/shared/editor-text/EditorText";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const AboutUs = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useQuery({
    queryKey: ["about-us"],
    queryFn: () =>
      getAboutusContent().then((res) => {
        return res?.data?.data;
      }),
  });

  return (
    <div className="flex flex-col gap-[2rem]">
      <div className="flex justify-center items-end">
        <ConnectSVG flip={localStorage.getItem("i18nextLng") === "ar"} />
        <p className={"font-semibold text-content-600 text-lg"}>
          {t("aboutUs.stayConnected")}
        </p>
      </div>
      {isLoading ? (
        <ContentSkeletons header={true} />
      ) : !data || error ? (
        <div className="px-4 sm:px-6 lg:px-8 pb-16">
          <NoDataFound
            image={<NoContentSVG />}
            text={
              error
                ? t("aboutUs.failedToLoadAboutUsData")
                : t("aboutUs.noContentAvailable")
            }
          />
        </div>
      ) : (
        <>
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-center">
              {isLoading ? (
                <Skeleton
                  variant="text"
                  width="50%"
                  height={50}
                  className={"m-auto"}
                />
              ) : (
                // data?.page_title || t("aboutUs.About us")
                t("aboutUs.About us")
              )}
            </h1>
            <p className="text-xl text-gray-600 text-center leading-relaxed">
              {isLoading ? (
                <Skeleton
                  variant="text"
                  width="80%"
                  height={30}
                  className={"m-auto"}
                />
              ) : (
                data?.page_intro || ""
              )}
            </p>
          </div>

          {isLoading ? (
            <Skeleton variant="rectangular" width="100%" height={200} />
          ) : (
            <EditorText htmlContent={data?.page_content || ""} />
          )}
        </>
      )}
    </div>
  );
};

export default AboutUs;
