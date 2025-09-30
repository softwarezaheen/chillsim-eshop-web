//UTILITIES
import React, { useMemo, useState } from "react";
//COMPONENT
import {
  Avatar,
  AvatarGroup,
  Button,
  Card,
  CardContent,
  Skeleton,
} from "@mui/material";
import BundleDetail from "../detail/BundleDetail";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { gtmEvent, gtmViewItemEvent, gtmAddToCartEvent } from "../../../core/utils/gtm.jsx";

const BundleCard = ({
  bundle,
  countryData,
  isLoading,
  globalDisplay,
  cruises,
  iccid,
  regionIcon,
}) => {
  const { t } = useTranslation();
  const [openDetail, setOpenDetail] = useState(false);
  const handleDetail = () => {
    // Send GA4 view_item event
    gtmViewItemEvent({
      ...bundle,
      currency: bundle?.currency_code
    }, !!iccid);

    // Legacy events for backward compatibility
    // if (iccid) {
    //   gtmEvent("view_topup_details", {
    //     bundle_id: bundle?.bundle_code || "",
    //     bundle_name: bundle?.display_title || bundle?.title || "",
    //     amount: bundle?.price || 0,
    //     currency: bundle?.currency_code || "",
    //     iccid: iccid
    //   });
    // } else {
    //   gtmEvent("view_product_details", {
    //     bundle_id: bundle?.bundle_code || "",
    //     bundle_name: bundle?.display_title || bundle?.title || "",
    //     amount: bundle?.price || 0,
    //     currency: bundle?.currency_code || ""
    //   });
    // }
    setOpenDetail(true);
  };

  const formatValidity = (validityDisplay) => {
    if (!validityDisplay) return "";

    const [num, rawUnit] = validityDisplay.split(" ");
    const count = Number(num);
    if (isNaN(count) || !rawUnit) return validityDisplay;

    const unitKeyRaw = rawUnit.toLowerCase().replace(/s$/, "");
    const unitKey = count === 1 ? unitKeyRaw : `${unitKeyRaw}_plural`;

    const translatedUnit = i18next.t(`bundles.unit.${unitKey}`);

    return `${count} ${translatedUnit}`;
  };

  const avatarSrc = useMemo(() => {
    if (globalDisplay) return "/media/global.svg";
    else if (regionIcon)
      return regionIcon; //NOTES: requested to be done from frontend manually taken by props
    else return bundle?.icon;
  }, [globalDisplay, regionIcon, bundle]);

  return (
    <>
      <Card 
        className="!rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
        onClick={handleDetail}
      >
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between justify-center sm:items-center sm:items-start gap-4">
            <div className="flex flex-row  items-center gap-2 min-w-0">
              {isLoading ? (
                <>
                  <Skeleton variant="circular" width={45} height={45} />
                  <Skeleton variant="text" width="100px" height={24} />
                </>
              ) : (
                <>
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
                  <p
                    dir={"ltr"}
                    className="text-content-600 font-bold text-lg capitalize truncate"
                  >
                    {bundle?.display_title}
                  </p>
                </>
              )}
            </div>
            <p
              dir={"ltr"}
              className="text-2xl font-bold text-end whitespace-nowrap text-primary"
            >
              {isLoading ? (
                <Skeleton variant="text" width="30px" height={32} />
              ) : (
                bundle?.gprs_limit_display
              )}
            </p>
          </div>
          <hr />
          <div className="flex flex-row justify-between items-center gap-4">
            <p className="text-sm truncate min-w-0">
              {isLoading ? (
                <Skeleton variant="text" width="100px" height={20} />
              ) : (
                `${t("bundles.validity")}: ${formatValidity(
                  bundle?.validity_display
                )}`
              )}
            </p>
            <div className="flex flex-row justify-between items-center gap-2 whitespace-nowrap">
              {!globalDisplay &&
                countryData &&
                (isLoading ? (
                  <>
                    <Skeleton variant="text" width={"50px"} height={20} />
                    <Skeleton variant="circular" width={20} height={20} />
                  </>
                ) : (
                  <>
                    <p className="text-sm">{t("bundles.availableIn")}</p>
                    <Avatar
                      src={countryData?.icon}
                      alt="bundle-country-image"
                      sx={{ width: 20, height: 20 }}
                    />
                  </>
                ))}
            </div>
          </div>
          {!cruises && (
            <div className="flex flex-row justify-between gap-4 bg-bgLight rounded-lg p-4">
              <p className="text-primary font-semibold text-sm">
                {t("bundles.supportedCountries")}
              </p>
              <AvatarGroup
                max={4}
                total={bundle?.count_countries || 0}
                sx={{
                  "& .MuiAvatar-root": {
                    width: 20,
                    height: 20,
                    fontSize: "0.75rem",
                  },
                  "& .MuiAvatarGroup-avatar": {
                    width: 20,
                    height: 20,
                    fontSize: "0.5rem",
                  },
                  "& .MuiAvatar-root:first-of-type": {
                    zIndex: 1,
                  },
                }}
              >
                {isLoading &&
                  Array.from({ length: 4 }).map((_, idx) => (
                    <Skeleton
                      variant="circular"
                      width={20}
                      height={20}
                      key={idx}
                    />
                  ))}
                {!isLoading && bundle?.countries?.length === 0 ? (
                  <DoDisturbIcon color="primary" />
                ) : (
                  bundle?.countries?.map((supportedCountries, index) => (
                    <Avatar
                      key={index}
                      alt={supportedCountries?.country}
                      src={supportedCountries?.icon}
                    />
                  ))
                )}
              </AvatarGroup>
            </div>
          )}
          {isLoading ? (
            <Skeleton
              variant="rectangular"
              width="100%"
              height={40}
              className="mt-4"
            />
          ) : (
            <Button
              color="primary"
              variant="contained"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                
                // Send GA4 add_to_cart event
                gtmAddToCartEvent({
                  ...bundle,
                  currency: bundle?.currency_code
                }, !!iccid, iccid);

                // Legacy event for backward compatibility
                if (iccid) {
                  gtmEvent("add_to_cart_topup", {
                    bundle_id: bundle?.bundle_code || "",
                    bundle_name: bundle?.display_title || bundle?.title || "",
                    amount: bundle?.price || 0,
                    currency: bundle?.currency_code || "",
                    quantity: 1,
                    iccid: iccid
                  });
                }
                handleDetail();
              }}
            >
              <p className="font-bold text-base max-w-24px">
                {t("btn.buyNow")} - {(bundle?.price_display)} 
              </p>
            </Button>
          )}
        </CardContent>
      </Card>
      {openDetail && (
        <BundleDetail
          formatValidity={formatValidity}
          regionIcon={regionIcon}
          globalDisplay={globalDisplay}
          onClose={() => setOpenDetail(false)}
          bundle={bundle}
          iccid={iccid}
          countryData={countryData}
        />
      )}
    </>
  );
};

export default BundleCard;
