//UTILITIES
import React, { use, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
//API
import { userLimitedLogin } from "../../core/apis/authAPI";
import { getBundleById } from "../../core/apis/bundlesAPI";
import { validatePromotion } from "../../core/apis/promotionAPI";
//REDUCER
import {
  LimitedSignIn,
  LimitedSignOut,
} from "../../redux/reducers/authReducer";
//COMPONENT
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  FormCheckBox,
  FormInput,
} from "../../components/shared/form-components/FormComponents";
import { Button, Link, Skeleton } from "@mui/material";
import { StripePayment } from "../../components/stripe-payment/StripePayment";
import PaymentFlow from "../../components/payment/PaymentFlow";
import { useTranslation } from "react-i18next";
import { gtmEvent, gtmBeginCheckoutEvent } from "../../core/utils/gtm.jsx";
import { formatValidity } from "../../assets/utils/formatValidity";

const Checkout = () => {
  const { isAuthenticated, tmp } = useSelector((state) => state.authentication);
  const { login_type } = useSelector((state) => state.currency);
  
  // Get referral discount state
  const { discountPercentage, referrerName, isEligible } = useSelector((state) => state.referral);
  
  const { id, iccid } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoValidationMessage, setPromoValidationMessage] = useState("");
  const [promoErrorMessage, setPromoErrorMessage] = useState("");
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [isPromoValidating, setIsPromoValidating] = useState(false);
  const [isWalletPaymentWithSufficientBalance, setIsWalletPaymentWithSufficientBalance] = useState(false);
  const dispatch = useDispatch();

  const handleApplyPromoCode = async () => {
    if (promoCode.trim() && !isPromoApplied && !isPromoValidating) {
      // Set loading state
      setIsPromoValidating(true);
      // Clear any previous messages
      setPromoValidationMessage("");
      setPromoErrorMessage("");
      
      try {
        const response = await validatePromotion({
          promo_code: promoCode.trim().toUpperCase(),
          bundle_code: data?.bundle_code
        });
        
        if (response?.data?.message) {
          setPromoValidationMessage(response.data.message);
          setIsPromoApplied(true);
          // Trigger PaymentFlow to reload assignMethod with new promo code
          setOrderDetail(null); // This will cause PaymentFlow to re-run assignMethod
        }
      } catch (error) {
        setPromoErrorMessage(t("checkout.invalidPromoCode"));
      } finally {
        setIsPromoValidating(false);
      }
    }
  };

  const getDisplayAmount = (amount) => {
    if (
      orderDetail &&
      orderDetail.currency &&
      orderDetail.display_currency &&
      orderDetail.exchange_rate &&
      orderDetail.currency !== orderDetail.display_currency
    ) {
      // Convert to display currency
      return (parseFloat(amount) / orderDetail.exchange_rate).toFixed(2);
    }
    // No conversion needed
    return parseFloat(amount).toFixed(2);
  };

  // Calculate order total based on tax mode
  // For inclusive/none modes: VAT is already included in original_amount
  // For exclusive mode: VAT is added on top
  const calculateOrderTotal = (order) => {
    if (!order) return 0;
    const amount = order.original_amount || 0;
    const fee = order.fee || 0;
    const vat = order.vat || 0;
    
    // For exclusive mode, VAT is added on top
    // For inclusive/none modes, VAT is already included in original_amount
    if (order.tax_mode === "exclusive") {
      return amount + fee + vat;
    }
    // inclusive or none mode - VAT already included
    return amount + fee;
  };

  // Calculate original price from discounted amount (reverse calculation)
  // Backend returns already-discounted original_amount, we need to show the actual original
  const calculateOriginalPrice = (discountedAmount) => {
    if (!isEligible || !discountPercentage || iccid) { // Only for first purchases (!iccid)
      return discountedAmount;
    }
    // Reverse formula: actualOriginal = discounted / (1 - percentage/100)
    return discountedAmount / (1 - discountPercentage / 100);
  };

  const calculateDiscountAmount = (discountedAmount) => {
    if (!isEligible || !discountPercentage || iccid) {
      return 0;
    }
    const originalAmount = calculateOriginalPrice(discountedAmount);
    return originalAmount - discountedAmount;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: [`${id}-details`],
    queryFn: () =>
      getBundleById(id).then((res) => {
        const bundle = res?.data?.data;

        if (!bundle) return null;

        console.log(bundle, "BUNDLE DATA IN QUERY");

        return {
          ...bundle,
        };
      }),
    enabled: !!id,
  });

  console.log(data, "BUNDLE DATA");

  useEffect(() => {
    if (orderDetail && orderDetail.order_id) {
      // Send GA4 begin_checkout event with promocode info
      gtmBeginCheckoutEvent({
        bundle_details: data,
        order_amount: orderDetail.original_amount || 0,
        order_fee: orderDetail.fee || 0,
        order_vat: orderDetail.vat || 0,
        currency: orderDetail.currency,
        iccid: iccid,
        promo_code: orderDetail.promo_code || (isPromoApplied ? promoCode : null)
      });

      // Legacy event for backward compatibility - also include promocode
      // const legacyEcommerce = {
      //   order_id: orderDetail.order_id,
      //   bundle_id: data?.bundle_code || "",
      //   bundle_name: data?.display_title || data?.title || "",
      //   amount: (orderDetail.original_amount/100).toFixed(2),
      //   currency: orderDetail.currency,
      //   fee: (orderDetail.fee/100).toFixed(2),
      //   tax: (orderDetail.vat/100).toFixed(2),
      //   total: ((orderDetail.original_amount + orderDetail.fee + orderDetail.vat)/100).toFixed(2),
      // };

      // // Add coupon to legacy event if available
      // const couponCode = orderDetail.promo_code || (isPromoApplied ? promoCode : null);
      // if (couponCode) {
      //   legacyEcommerce.coupon = couponCode;
      // }

      // gtmEvent("checkout", {
      //   ecommerce: legacyEcommerce
      // });
    }
  }, [orderDetail, data, iccid, promoCode, isPromoApplied]);

  const confirmed = useMemo(() => {
    return isAuthenticated || tmp?.isAuthenticated;
  }, [isAuthenticated, tmp]);

  console.log(confirmed, "CONFIRMED STATUS");

  return (
    <div
      className={
        "flex flex-col gap-4 w-full max-w-xxl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16"
      }
    >
      <div
        className={
          "flex flex-row gap-2 items-center font-semibold cursor-pointer"
        }
        onClick={() => {
          navigate(-1);
          dispatch(LimitedSignOut());
        }}
      >
        <ArrowBackIosNewIcon
          sx={
            localStorage.getItem("i18nextLng") === "ar"
              ? { transform: "scale(-1,1)" }
              : {}
          }
          color="primary"
          fontSize="small"
        />{" "}
        {t("checkout.goBack")}
      </div>

      <div
        className={
          "flex flex-col-reverse items-start gap-4 w-full sm:flex-row sm:items-start sm:gap-4 sm:w-full"
        }
      >
        {isLoading ? (
          <div className={"w-full sm:basis-[50%] shrink-0"}>
            {Array(2)
              .fill()
              ?.map((_, index) => (
                <Skeleton
                  variant="rectangular"
                  height={150}
                  key={`checkout-skeleton-${index}`}
                />
              ))}
          </div>
        ) : !confirmed ? (
          // If not authenticated, redirect to signin/billing flow
          <div className={"w-full sm:basis-[50%] items-center justify-center flex flex-col gap-4"}>
            <h2 className="text-xl font-semibold">{t("checkout.authenticationRequired")}</h2>
            <p className="text-center">{t("checkout.redirectingToAuth")}</p>
            {(() => {
              // Redirect logic - this will execute immediately
              const checkoutUrl = `/checkout/${id}${iccid ? `/${iccid}` : ''}`;
              const billingUrl = `/billing?next=${encodeURIComponent(checkoutUrl)}`;
              
              // if (login_type === "phone") {
              navigate(`/signin?next=${encodeURIComponent(billingUrl)}`);
              // } else {
                // navigate(`/tmp-login?next=${encodeURIComponent(billingUrl)}`);
              // }
              return null;
            })()}
          </div>
        ) : (
          <PaymentFlow 
            key={`payment-flow-${isPromoApplied ? 'applied' : 'not-applied'}`}
            bundle={data}
            orderDetail={orderDetail}
            setOrderDetail={setOrderDetail}
            promoCode={promoCode}
            setIsWalletPaymentWithSufficientBalance={setIsWalletPaymentWithSufficientBalance}
          />

        )}
        <div
          className={
            "bg-primary-50 p-4 rounded-2xl flex flex-col gap-5 w-full sm:basis-[50%] shadow-sm grow-0 min-w-0"
          }
        >
          <h1 className={"font-bold text-2xl"}>{t("checkout.summary")}</h1>
          <div className={"flex flex-col gap-2 min-w-0"}>
            <div
              className={
                "flex flex-row justify-between items-start gap-[1rem] min-w-0"
              }
            >
              <label className={"flex-1 font-semibold"}>
                {t("checkout.bundleName")}
              </label>
              <p
                dir={"ltr"}
                className={`flex-1 font-bold truncate text-right`}
              >
                {data?.display_title && data?.gprs_limit_display && data?.validity_display
                  ? `${data.display_title} ${data.gprs_limit_display} ${formatValidity(data.validity_display)}`
                  : data?.display_title || t("common.notAvailable")}
              </p>
            </div>
            {!isWalletPaymentWithSufficientBalance && (
              <>
                {/* Hide subtotal row when fees are off AND tax is inclusive */}
                {!(!orderDetail?.fee_enabled && orderDetail?.tax_mode === "inclusive") && (
                  <div
                    className={"flex flex-row justify-between items-start gap-[1rem]"}
                  >
                    <label className={"flex-1 font-semibold"}>
                      {t("checkout.subtotal")}
                    </label>
                    <p
                      dir={"ltr"}
                      className={`flex-1 font-bold text-right `}
                    >
                    {orderDetail?.original_amount
                      ? getDisplayAmount(calculateOriginalPrice(orderDetail.original_amount) / 100) + " " + (orderDetail.display_currency || orderDetail.currency)
                      : "---"}
                    </p>
                  </div>
                )}
              {isEligible && discountPercentage && !iccid && orderDetail?.original_amount && (
                <div
                  className={"flex flex-row justify-between items-center gap-[1rem]"}
                  style={{ color: '#22c55e' }}
                >
                  <label className={"flex-1 font-semibold"}>
                    {t("checkout.discount")} {discountPercentage}%{referrerName && ` ${t("checkout.from")} ${referrerName}`}
                  </label>
                  <p
                    dir={"ltr"}
                    className={`flex-1 font-bold text-right`}
                  >
                    - {getDisplayAmount(calculateDiscountAmount(orderDetail.original_amount) / 100)} {orderDetail.display_currency || orderDetail.currency}
                  </p>
                </div>
              )}
              {/* Fee row - only show if fee_enabled is true and fee exists */}
              {orderDetail?.fee_enabled !== false && (
              <div
                  className={
                    "flex flex-row justify-between items-start gap-[1rem]"
                  }
                >
                  <label className={"flex-1 font-semibold"}>
                    {t("checkout.fee")}
                  </label>
                  <p dir="ltr" className="flex-1 font-bold text-right">
                    {orderDetail?.fee
                      ? getDisplayAmount(orderDetail.fee / 100) + " " + (orderDetail.display_currency || orderDetail.currency)
                      : "---"}
                  </p>
                </div>
              )}
                {/* Tax row - only show for exclusive mode (not inclusive or none) */}
                {orderDetail?.tax_mode === "exclusive" && (
                <div
                  className={
                    "flex flex-row justify-between items-start gap-[1rem]"
                  }
                >
                  <label className={"flex-1 font-semibold"}>
                    {t("checkout.tax")}
                  </label>
                  <p dir="ltr" className="flex-1 font-bold text-right">
                    {orderDetail?.vat
                      ? getDisplayAmount(orderDetail.vat / 100) + " " + (orderDetail.display_currency || orderDetail.currency)
                      : "---"}
                  </p>
                </div>
                )}
                
              <hr />
              <div
                className={"flex flex-row justify-between items-start gap-[1rem]"}
              >
                <label className={"font-semibold"}>{t("checkout.total")}</label>
                <p dir="ltr" 
                  className={
                    orderDetail &&
                    orderDetail.display_currency &&
                    orderDetail.currency &&
                    orderDetail.display_currency !== orderDetail.currency
                      ? "font-bold text-right"
                      : "font-bold text-2xl text-right"
                  }
                >
                  {!orderDetail
                    ? t("common.loading")
                    : (
                        getDisplayAmount(calculateOrderTotal(orderDetail)/100) +
                        " " +
                        (orderDetail.display_currency || orderDetail.currency)
                      )
                  }
                </p>
              </div>
              {orderDetail &&
                orderDetail.display_currency &&
                orderDetail.currency &&
                orderDetail.display_currency !== orderDetail.currency && (
                  <>
                    <div className="flex flex-row justify-between items-start gap-[1rem]">
                      <label className="font-semibold">
                        {t("checkout.totalToBePaidIn", { currency: orderDetail.currency })}
                      </label>
                      <p dir="ltr" className="font-bold text-2xl text-right">
                        {(
                          calculateOrderTotal(orderDetail) / 100
                        ).toFixed(2) + " " + orderDetail.currency}
                      </p>
                    </div>
                    <div className="flex flex-row justify-between items-start gap-[1rem]">
                      <label className="font-medium">
                        {t("checkout.exchangeRate")}
                      </label>
                      <p dir="ltr" className="font-medium text-right">
                        {`1 ${orderDetail.display_currency} = ${orderDetail.exchange_rate} ${orderDetail.currency}`}
                      </p>
                    </div>
                  </>
                )
              }
              </>
            )}
          {/* Promo Code Section - Only show for new purchases, not top-ups, and when no referral code exists */}
          {!iccid && !localStorage.getItem("referred_by") && (
            <div className="flex flex-col gap-2 mt-4">
              <label className="font-semibold text-sm">{t("checkout.promoCode")}</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    if (!isPromoApplied) {
                      setPromoCode(e.target.value.toUpperCase());
                      setPromoValidationMessage(""); // Clear message when user starts typing
                      setPromoErrorMessage(""); // Clear error message when user starts typing
                    }
                  }}
                  placeholder={t("checkout.enterPromoCode")}
                  disabled={!orderDetail ? true :isPromoApplied}
                  className="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleApplyPromoCode}
                  disabled={!promoCode.trim() || isPromoApplied || isLoading || isPromoValidating}
                  className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPromoValidating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t("common.validating")}
                    </>
                  ) : !orderDetail ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t("common.loading")}
                    </>
                  ) : (
                    t("checkout.apply")
                  )}
                </button>
              </div>
              {promoValidationMessage && (
                <p className="text-green-600 text-sm font-medium">{promoValidationMessage}</p>
              )}
              {promoErrorMessage && (
                <p className="text-red-600 text-sm font-medium">{promoErrorMessage}</p>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
