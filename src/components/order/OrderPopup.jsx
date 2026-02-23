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
import { gtmEvent, gtmPurchaseEvent } from "../../core/utils/gtm.jsx";
import { isUserAuthenticated } from "../../core/utils/authHelpers";
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
import PromotionsInline from "../promotions/PromotionsInline";
import AutoTopupPrompt from "../auto-topup/AutoTopupPrompt";

const OrderPopup = ({ id, onClose, orderData, isFromPaymentCompletion = false }) => {
  const { t } = useTranslation();
  const { iccid } = useParams(); // Get iccid from URL to detect topup
  const authState = useSelector((state) => state.authentication);
  const { user_info } = authState;
  const isAuth = isUserAuthenticated(authState);

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
    if (!isAuth) {
      onClose();
    }
  }, []);

  // Send GTM event when order data is loaded (only for payment completion)
  useEffect(() => {
    if (isFromPaymentCompletion && orderHistoryData && id) {
      // Determine if this is a topup based on iccid presence or order data
      const isTopup = !!iccid || orderHistoryData?.order_type === 'topup' || orderHistoryData?.iccid;
      const eventName = isTopup ? "purchase_topup" : "purchase_bundle";
      
      // Send GA4 ecommerce purchase event
      gtmPurchaseEvent(eventName, {
        order_id: id,
        currency: orderHistoryData?.order_currency || "",
        total_amount: (orderHistoryData?.order_amount || 0) + 
                      (orderHistoryData?.order_fee || 0) + 
                      (orderHistoryData?.order_vat || 0),
        bundle_details: orderHistoryData?.bundle_details,
        order_amount: orderHistoryData?.order_amount || 0,
        order_fee: orderHistoryData?.order_fee || 0,
        order_vat: orderHistoryData?.order_vat || 0,
        payment_type: orderHistoryData?.payment_type || "",
        promo_code: orderHistoryData?.promo_code || "",
        discount: orderHistoryData?.discount || 0,
        ...(isTopup && { iccid: iccid || orderHistoryData?.iccid }), // Add iccid for topups
      });
      
      // Also send the legacy gtmEvent for backward compatibility (if needed)
      
      // to be removed in future
      // const eventNameLegacy = isTopup ? "purchase_topup_legacy" : "purchase_bundle_legacy";
      // gtmEvent(eventNameLegacy, {
      //   ecommerce: {
      //     order_id: id,
      //     product_id: orderHistoryData?.bundle_details?.bundle_code || "",
      //     product_name: orderHistoryData?.bundle_details?.display_title || "",
      //     amount: ((orderHistoryData?.order_amount || 0) / 100).toFixed(2),
      //     currency: orderHistoryData?.order_currency || "",
      //     fee: ((orderHistoryData?.order_fee || 0) / 100).toFixed(2),
      //     tax: ((orderHistoryData?.order_vat || 0) / 100).toFixed(2),
      //     total: (
      //       ((orderHistoryData?.order_amount || 0) +
      //         (orderHistoryData?.order_fee || 0) +
      //         (orderHistoryData?.order_vat || 0)) /
      //       100
      //     ).toFixed(2),
      //     payment_type: orderHistoryData?.payment_type || "",
      //     promo_code: orderHistoryData?.promo_code || "",
      //     discount: orderHistoryData?.discount || 0,
      //     ...(isTopup && { iccid: iccid || orderHistoryData?.iccid }), // Add iccid for topups
      //   }
      // });
    }
  }, [orderHistoryData, id, isFromPaymentCompletion, iccid]);

  return (
    <Dialog open={true} maxWidth="sm">
      <DialogContent className="flex flex-col gap-[0.4rem] sm:gap-[0.6rem] xs:!px-8 !py-3 sm:!py-5 min-w-[200px] max-w-[500px]">
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
        <h1 className={"mt-1 text-center text-base sm:text-lg font-bold"}>{t("orders.qrcode_detail")}</h1>
        {!isLoading ? (
          orderData || data ? (
            <p className={"text-center text-content-600 text-xs sm:text-sm font-medium"}>
              {t("orders.qrcode_sent_text")}
            </p>
          ) : (
            ""
          )
        ) : (
          <div className={"flex flex-col gap-[1rem]"}>
            <p className={"text-center text-content-600 text-xs sm:text-sm font-medium"}>
              {t("orders.qrcode_loading")}
            </p>
            <Skeleton width={"100%"} />
          </div>
        )}
        {!isLoading && (data || orderData) && (
          <>
            <div
              className={
                "bg-primary-50 p-2 sm:p-3 rounded-xl flex items-center justify-center shadow-sm"
              }
            >
              <div
                className={
                  "bg-white p-1.5 flex items-center justify-center w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] rounded-md shadow-sm"
                }
              >
                {isLoading ? (
                  <Skeleton variant="rectangle" width={100} height={100} />
                ) : orderData?.qr_code_value || data?.qr_code_value ? (
                  <QRCode
                    size={100}
                    style={{ height: "130px", width: "130px" }}
                    value={data?.qr_code_value || orderData?.qr_code_value}
                    viewBox={`0 0 256 256`}
                  />
                ) : (
                  <NoDataFound text="QR code not generated" />
                )}
              </div>
            </div>
            <div className={"flex flex-col gap-[0.25rem]"}>
              <label
                dir={"ltr"}
                className={`font-semibold text-[0.65rem] sm:text-xs ${
                  localStorage.getItem("i18nextLng") === "ar"
                    ? "text-right"
                    : "text-left"
                }`}
              >
                SM-DP+ &nbsp;{t("orders.smdpAddress")}
              </label>
              <div
                className={
                  "flex flex-row justify-between items-center bg-white shadow-sm p-[0.3rem] sm:p-[0.5rem] rounded-md"
                }
              >
                <p className={"font-medium text-content-500 text-[0.6rem] sm:text-xs truncate "}>
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
            <div className={"flex flex-col gap-[0.25rem]"}>
              <label className={"font-semibold text-[0.65rem] sm:text-xs"}>
                {t("orders.activateCode")}
              </label>
              <div
                className={
                  "flex flex-row justify-between items-center bg-white shadow-sm p-[0.3rem] sm:p-[0.5rem] rounded-md"
                }
              >
                <p className={"font-medium text-content-500 text-[0.6rem] sm:text-xs truncate"}>
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
            
            {/* Auto Top-Up Prompt — only for new bundle purchases from payment completion (not unlimited bundles, not top-ups) */}
            {isFromPaymentCompletion && orderHistoryData?.order_type !== 'topup' && (data?.iccid || orderData?.iccid) && orderHistoryData?.bundle_details?.bundle_code && !orderHistoryData?.bundle_details?.unlimited && (
              <AutoTopupPrompt
                iccid={data?.iccid || orderData?.iccid}
                bundleId={orderHistoryData?.bundle_details?.bundle_code}
                bundleName={orderHistoryData?.bundle_details?.display_title || orderHistoryData?.bundle_details?.bundle_code}
                dataAmount={orderHistoryData?.bundle_details?.gprs_limit_display || ""}
                validity={orderHistoryData?.bundle_details?.validity_display || ""}
              />
            )}

            {/* Promotions Inline Component - Show if user is authenticated and doesn't have notifications enabled */}
            {isAuth && !user_info?.should_notify && (
              <PromotionsInline />
            )}
            
            {/* Download Invoice Button */}
            {orderHistoryData?.pdf_url && (
              <div className="flex flex-col gap-[0.25rem] mt-1">
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={async () => {
                    try {
                      // Import the API function
                      const { getInvoicePDF } = await import('../../core/apis/authAPI');
                      
                      // Download the PDF
                      const response = await getInvoicePDF(id);
                      
                      // Create blob and download
                      const blob = new Blob([response.data], { type: 'application/pdf' });
                      const url = URL.createObjectURL(blob);
                      
                      // Extract filename from Content-Disposition header or use default
                      let filename = `invoice_${id}.pdf`;
                      const contentDisposition = response.headers['content-disposition'];
                      if (contentDisposition) {
                        const match = contentDisposition.match(/filename="(.+)"/);
                        if (match) {
                          filename = match[1];
                        }
                      }
                      
                      // Create download link and trigger download
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = filename;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      
                      // Clean up the blob URL
                      URL.revokeObjectURL(url);
                      
                      toast.success(t('orders.invoiceDownloaded'));
                    } catch (error) {
                      console.error('Error downloading invoice:', error);
                      toast.error(t('orders.invoiceDownloadError'));
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  📄 {t('orders.downloadInvoice')}
                </Button>
              </div>
            )}
            
          </>
        )}

        {!isLoading && !data && !orderData && (
          <NoDataFound
            text={`${t("orders.failedToLoad")}${
              !isAuth ? ` ${t("orders.pleaseSignIn")}` : ""
            } `}
          />
        )}
        {!isAuth && (
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
