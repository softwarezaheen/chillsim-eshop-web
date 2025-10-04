import React from "react";
import { useQuery } from "react-query";
import { getCookiesPolicyContent } from "../core/apis/homeAPI";
import { Skeleton } from "@mui/material";
import NoDataFound from "../components/shared/no-data-found/NoDataFound";
import { ContentSkeletons } from "../components/shared/skeletons/HomePageSkeletons";
import { NoContentSVG } from "../assets/icons/Common";
import EditorText from "../components/shared/editor-text/EditorText";
import { useTranslation } from "react-i18next";

const CookiePolicy = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useQuery({
    queryKey: [`cookies-policy-content`],
    queryFn: () =>
      getCookiesPolicyContent().then((res) => {
        return res?.data?.data;
      }),
  });

  return (
    <>
      {isLoading ? (
        <ContentSkeletons />
      ) : !data || error ? (
        <div className="px-4 sm:px-6 lg:px-8 pb-16">
          <NoDataFound
            image={<NoContentSVG />}
            text={
              error
                ? t("cookiePolicy.failedToLoadCookiePolicyData")
                : t("aboutUs.noContentAvailable")
            }
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto flex flex-col gap-3">
              <h1 className="text-4xl font-bold text-center">
                {isLoading ? (
                  <Skeleton
                    variant="text"
                    width="50%"
                    height={50}
                    className={"m-auto"}
                  />
                ) : (
                  data?.page_title || t("footer.cookiePolicy")
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
          </div>

          {isLoading ? (
            <Skeleton variant="rectangular" width="100%" height={200} />
          ) : (
            <EditorText htmlContent={data?.page_content || ""} />
          )}
        </div>
      )}
    </>
  );
};

export default CookiePolicy;