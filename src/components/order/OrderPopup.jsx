//UTILITIES
import React, { useEffect } from "react";
import QRCode from "react-qr-code";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

//API
import { getOrderByID, getOrderHistoryById } from "../../core/apis/userAPI";
import { gtmEvent } from "../../core/utils/gtm.jsx";
//COMPONENT
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import NoDataFound from "../shared/no-data-found/NoDataFound";
import { Close } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Skeleton,
} from "@mui/material";
import { Link } from "react-router-dom";

const OrderPopup = ({ id, onClose, orderData, isFromPaymentCompletion = false }) => {
  const { t } = useTranslation();
  const { iccid } = useParams(); // Get iccid from URL to detect topup
  const { isAuthenticated, user_info, tmp } = useSelector(
    (state) => state.authentication
  );

  const { data, isLoading, error } = useQuery({
    queryKey: [`${user_info?.id}-order-${id}`],
    queryFn: () => getOrderByID(id).then((res) => res?.data?.data),
    enabled: !!id,
  });

  // Fetch order history for GTM event (only when from payment completion)
  const { data: orderHistoryData } = useQuery({
    queryKey: [`${user_info?.id}-order-history-${id}`],
    queryFn: () => getOrderHistoryById(id).then((res) => res?.data?.data),
    enabled: !!id && isFromPaymentCompletion,
  });

  useEffect(() => {
    //   //close popup if 401
    if (!isAuthenticated && !tmp?.isAuthenticated) {
      onClose();
    }
  }, []);

  // Send GTM event when order data is loaded (only for payment completion)
  useEffect(() => {
    if (isFromPaymentCompletion && orderHistoryData && id) {
      // Determine if this is a topup based on iccid presence or order data
      const isTopup = !!iccid || orderHistoryData?.order_type === 'topup' || orderHistoryData?.iccid;
      const eventName = isTopup ? "purchased_topup" : "purchased_bundle";
      
      gtmEvent(eventName, {
        ecommerce: {
          order_id: id,
          product_id: orderHistoryData?.bundle_details?.bundle_code || "",
          product_name: orderHistoryData?.bundle_details?.display_title || "",
          amount: ((orderHistoryData?.order_amount || 0) / 100).toFixed(2),
          currency: orderHistoryData?.order_currency || "",
          fee: ((orderHistoryData?.order_fee || 0) / 100).toFixed(2),
          tax: ((orderHistoryData?.order_vat || 0) / 100).toFixed(2),
          total: (
            ((orderHistoryData?.order_amount || 0) +
              (orderHistoryData?.order_fee || 0) +
              (orderHistoryData?.order_vat || 0)) /
            100
          ).toFixed(2),
          payment_type: orderHistoryData?.payment_type || "",
          promo_code: orderHistoryData?.promo_code || "",
          discount: orderHistoryData?.discount || 0,
          ...(isTopup && { iccid: iccid || orderHistoryData?.iccid }), // Add iccid for topups
        }
      });
    }
  }, [orderHistoryData, id, isFromPaymentCompletion, iccid]);

  return (
    <Dialog open={true} maxWidth="sm">
      <DialogContent className="flex flex-col gap-[1rem] xs:!px-8 !py-10 min-w-[200px] max-w-[500px]">
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
        <h1 className={"mt-2 text-center"}>{t("orders.qrcode_detail")}</h1>
        {!isLoading ? (
          orderData || data ? (
            <p className={"text-center text-content-600 font-medium"}>
              {t("orders.qrcode_sent_text")}
            </p>
          ) : (
            ""
          )
        ) : (
          <div className={"flex flex-col gap-[1rem]"}>
            <p className={"text-center text-content-600 font-medium"}>
              {t("orders.qrcode_loading")}
            </p>
            <Skeleton width={"100%"} />
          </div>
        )}
        {!isLoading && (data || orderData) && (
          <>
            <div
              className={
                "bg-primary-50 p-4 rounded-2xl flex items-center justify-center shadow-sm"
              }
            >
              <div
                className={
                  "bg-white p-2 flex items-center justify-center w-[200px] h-[200px] rounded-md shadow-sm"
                }
              >
                {isLoading ? (
                  <Skeleton variant="rectangle" width={100} height={100} />
                ) : orderData?.qr_code_value || data?.qr_code_value ? (
                  <QRCode
                    size={100}
                    style={{ height: "150px", width: "150px" }}
                    value={data?.qr_code_value || orderData?.qr_code_value}
                    viewBox={`0 0 256 256`}
                  />
                ) : (
                  <NoDataFound text="QR code not generated" />
                )}
              </div>
            </div>
            <div className={"flex flex-col gap-[0.5rem]"}>
              <label
                dir={"ltr"}
                className={`font-semibold ${
                  localStorage.getItem("i18nextLng") === "ar"
                    ? "text-right"
                    : "text-left"
                }`}
              >
                SM-DP+ &nbsp;{t("orders.smdpAddress")}
              </label>
              <div
                className={
                  "flex flex-row justify-between items-center bg-white shadow-sm p-[0.8rem] rounded-md"
                }
              >
                <p className={"font-medium text-content-500 truncate "}>
                  {isLoading ? (
                    <Skeleton width={100} />
                  ) : (
                    data?.smdp_address || orderData?.smdp_address
                  )}
                </p>
                <IconButton
                  onClick={() => {
                    navigator.clipboard.writeText(
                      data?.smdp_address || orderData?.smdp_address
                    );
                    toast.success(t("btn.copiedSuccessfully"));
                  }}
                >
                  <ContentCopyIcon fontSize="small" color="primary" />
                </IconButton>
              </div>
            </div>
            <div className={"flex flex-col gap-[0.5rem]"}>
              <label className={"font-semibold"}>
                {t("orders.activateCode")}
              </label>
              <div
                className={
                  "flex flex-row justify-between items-center bg-white shadow-sm p-[0.8rem] rounded-md"
                }
              >
                <p className={"font-medium text-content-500 truncate"}>
                  {isLoading ? (
                    <Skeleton width={100} />
                  ) : (
                    orderData?.activation_code || data?.activation_code
                  )}
                </p>
                <IconButton
                  onClick={() => {
                    navigator.clipboard.writeText(
                      orderData?.activation_code || data?.activation_code
                    );
                    toast.success(t("btn.copiedSuccessfully"));
                  }}
                >
                  <ContentCopyIcon fontSize="small" color="primary" />
                </IconButton>
              </div>
            </div>{" "}
          </>
        )}

        {!isLoading && !data && !orderData && (
          <NoDataFound
            text={`${t("orders.failedToLoad")}${
              !isAuthenticated ? ` ${t("orders.pleaseSignIn")}` : ""
            } `}
          />
        )}
        {!isAuthenticated && (
          <Button
            variant="contained"
            color="primary"
            to={"/signin"}
            component={Link}
          >
            {t("btn.signin_signup")}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderPopup;
