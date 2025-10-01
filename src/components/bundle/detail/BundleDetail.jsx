//UTILITIES
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
//COMPONENT
import NoDataFound from "../../shared/no-data-found/NoDataFound";
import { Close, QuestionMark } from "@mui/icons-material";
import {
  Avatar,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { checkBundleExist } from "../../../core/apis/userAPI";
import { toast } from "react-toastify";
import BundleExistence from "./BundleExistence";
import { useSelector } from "react-redux";
import clsx from "clsx";
import TooltipComponent from "../../shared/tooltip/TooltipComponent";
import { useTranslation, Trans } from "react-i18next";
import { formatValidity } from "../../../assets/utils/formatValidity";
import { gtmEvent, gtmAddToCartEvent } from "../../../core/utils/gtm.jsx";

const BundleDetail = ({
  onClose,
  bundle,
  globalDisplay,
  iccid,
  regionIcon,
}) => {
  const { t } = useTranslation();
  const isSmall = useMediaQuery("(max-width: 639px)");
  const navigate = useNavigate();
  const { isAuthenticated, tmp } = useSelector((state) => state.authentication);
  const login_type = useSelector((state) => state.currency?.login_type);
  const [openRedirection, setOpenRedirection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckExist = () => {
    //order top-up

    console.log(
      tmp?.isAuthenticated,
      isAuthenticated,
      "checking authentication"
    );

    // First, check if user is authenticated at all
    if (!tmp?.isAuthenticated && !isAuthenticated) {
      // Send completely unauthenticated users to signin first (always email login)
      navigate(
        `/signin?next=${encodeURIComponent(`/billing?next=/checkout/${bundle?.bundle_code}`)}`
      );
      return;
    }

    // If authenticated, always go to billing first (billing will handle existing info)
    if (iccid) {
      navigate(`/billing?next=${encodeURIComponent(`/checkout/${bundle?.bundle_code}/${iccid}`)}`);
      return;
    } else {
      // For normal orders, check if bundle exists first
      setIsSubmitting(true);

      checkBundleExist(bundle?.bundle_code)
        .then((res) => {
          if (res?.data?.status === "success") {
            if (res?.data?.data) {
              setOpenRedirection(true);
            } else {
              navigate(`/billing?next=${encodeURIComponent(`/checkout/${bundle?.bundle_code}`)}`);
            }
          } else {
            toast.error(res?.message);
          }
        })
        .catch((e) => {
          toast?.error(e?.message || "Failed to check bundle existence");
        })
        .finally(() => setIsSubmitting(false));
    }
  };

  const avatarSrc = useMemo(() => {
    if (globalDisplay) return "/media/global.svg";
    else if (regionIcon)
      return regionIcon; //NOTES: requested to be done from frontend manually taken by props
    else return bundle?.icon;
  }, [globalDisplay, regionIcon, bundle]);

  return (
    <Dialog 
      fullWidth 
      open={true} 
      maxWidth={"sm"}
      onClose={onClose}
    >
      <DialogContent className={"flex flex-col gap-2"}>
        <div className={"flex flex-row justify-end"}>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={() =>
              localStorage.getItem("i18nextLng") === "ar"
                ? {
                    position: "absolute",
                    left: 8,
                    top: 8,
                    color: "black",
                  }
                : {
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: "black",
                  }
            }
          >
            <Close />
          </IconButton>
        </div>
        <div
          className={
            "mt-2 flex flex-col sm:flex-row justify-between sm:items-start gap-[0.3rem]"
          }
        >
          <div className={"flex flex-row gap-4 items-center min-w-0 "}>
            <Avatar
              src={avatarSrc}
              alt={bundle?.display_title || ""}
              sx={{ width: 45, height: 45 }}
            >
              {/* fallback image */}
              <img
                src={"/media/global.svg"}
                className={"bg-white"}
                alt={bundle?.display_title || ""}
              />
            </Avatar>
            <div
              className={"flex flex-col justify-between items-start min-w-0"}
            >
              <p
                dir={"ltr"}
                className={
                  "text-xl font-bold text-primary truncate w-full sm:max-w-none"
                }
              >
                {bundle?.display_title || ""}
              </p>
              {/* NOTES: done by request because title and sub title are same
              <p className={"text-base text-color-400 truncate w-full"}>
                {bundle?.display_subtitle || ""}
              </p>
               */}
            </div>
          </div>
          <div
            className={
              "text-2xl font-bold text-primary flex justify-end break-all"
            }
          >
            {`${formatValidity(bundle?.validity_display)}` || ""}
          </div>
        </div>
        <hr />
        <div
          dir={"ltr"}
          className={
            "flex sm:flex-row justify-between  items-center text-2xl font-bold text-primary min-w-0 gap-[0.5rem]"
          }
        >
          <TooltipComponent title={isSmall ? bundle?.gprs_limit_display : ""}>
            <p className={"truncate min-w-0"}>{bundle?.gprs_limit_display}</p>
          </TooltipComponent>
          <p className={"flex flex-row justify-end whitespace-nowrap"}>
            {bundle?.price_display}
          </p>
        </div>
        <div
          className={
            "flex flex-col sm:flex-row gap-[1rem] items-start sm:min-h-[150px]"
          }
        >
          {bundle?.bundle_category?.type !== "CRUISE" && (
            <div
              className={
                "flex flex-col gap-[1rem] w-[100%] sm:basis-[50%] bg-bgLight rounded-md p-2 sm:min-h-[150px] max-h-[220px] sm:h-[220px]"
              }
            >
              <h6>
                {t("bundles.supportedCountries")}&nbsp;
                {bundle?.countries?.length !== 0 &&
                  `(${bundle?.countries?.length})`}
              </h6>
              <div
                className={
                  "flex flex-col gap-[0.5rem] overflow-x-hidden overflow-x-auto cursor-auto"
                }
              >
                {bundle?.countries?.length === 0 ? (
                  <NoDataFound text={t("bundles.bundleIsntSupportedCountry")} />
                ) : (
                  bundle?.countries?.map((supportedCountries, index) => (
                    <div
                      className={"flex flex-row gap-[1rem] items-center"}
                      key={`${index}`}
                    >
                      <Avatar
                        src={supportedCountries?.icon}
                        alt={
                          supportedCountries?.country ||
                          `supported-country-${index}`
                        }
                        sx={{ width: 20, height: 20 }}
                      />
                      <p>{supportedCountries?.country}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          <div
            className={clsx(
              "flex flex-col w-[100%] sm:basis-[50%]  gap-[1rem] bg-bgLight rounded-md p-2 sm:min-h-[150px] sm:h-[220px]",
              {
                "flex-1": bundle?.bundle_category?.type === "CRUISE",
              }
            )}
          >
            <h6>{t("bundles.additionalInfo")}</h6>

            <div
              className={
                "flex flex-col gap-[0.5rem] overflow-x-hidden overflow-x-auto cursor-auto"
              }
            >
              <div className={"flex flex-col gap-[0.1rem]"}>
                <div className={"text-content-600"}>
                  {t("bundles.planType")}
                </div>
                <p className={"font-semibold break-words"}>
                  {t(`planType.${bundle?.plan_type}`) ||
                    t("common.notAvailable")}
                </p>
              </div>
              <hr />
              <div className={"flex flex-col gap-[0.1rem]"}>
                <div className={"text-content-600"}>
                  {t("bundles.priceDetails")}
                </div>
                <p className={"font-semibold break-words"}>
                  {t(`price_details`) ||
                    t("common.notAvailable")}
                </p>
              </div>
              <hr />
              <div>
                <div className={"text-content-600"}>
                  {t("bundles.activationPolicy")}
                </div>
                <p className={"font-semibold break-words"}>
                  {t(`activity_policy`) || t("common.notAvailable")}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div
          className={
            "bg-bgLight flex flex-row gap-6 items-center p-2 rounded-md"
          }
        >
          <div className=" flex items-center justify-center basis-[10%]">
            <div
              className={
                "w-11 h-11 bg-[#d7e9f7] rounded-full flex items-center justify-center"
              }
            >
              <QuestionMark
                className="text-gray-700"
                fontSize="small"
                color={"info"}
              />
            </div>
          </div>
          <div className={"flex flex-col gap-1"}>
            <h6>{t("bundles.compatibility")}</h6>
            <p className={"text-sm font-bold break-words"}>
              <Trans
                i18nKey="bundles.findOut"
                values={{ code: "*#06#", term: "EID" }}
                components={[<span dir="ltr" />, <span dir="ltr" />]}
              />
            </p>
          </div>
        </div>
      </DialogContent>
      <div className={"px-[24px] py-[20px]"}>
        <Button
          disabled={isSubmitting}
          variant={"contained"}
          color="primary"
          onClick={() => {
            // Send GA4 add_to_cart event
            gtmAddToCartEvent({
              ...bundle,
              currency: bundle?.currency_code
            }, !!iccid, iccid);

            // Legacy events for backward compatibility
            // if (iccid) {
            //   gtmEvent("add_to_cart_topup", {
            //     ecommerce: {
            //       bundle_id: bundle?.bundle_code || "",
            //       bundle_name: bundle?.display_title || bundle?.title || "",
            //       amount: bundle?.price || 0,
            //       currency: bundle?.currency_code || "",
            //       quantity: 1,
            //       iccid: iccid,
            //     }
            //   });
            // } else {
            //   gtmEvent("add_to_cart_bundle", {
            //     ecommerce: {
            //       bundle_id: bundle?.bundle_code || "",
            //       bundle_name: bundle?.display_title || bundle?.title || "",
            //       amount: bundle?.price || 0,
            //       currency: bundle?.currency_code || "",
            //       quantity: 1,
            //     }
            //   });
            // }
            handleCheckExist()
          }}
        >
          <p className={"font-bold !text-base truncate max-w-20px"}>
            {isSubmitting
              ? t("btn.checkingBundle")
              : `${t("btn.buyNow")} - ${bundle?.price_display}`}
          </p>
        </Button>
      </div>
      {openRedirection && (
        <BundleExistence
          bundle={bundle}
          onClose={() => setOpenRedirection(false)}
          closeDetail={() => onClose()}
        />
      )}
    </Dialog>
  );
};

export default BundleDetail;