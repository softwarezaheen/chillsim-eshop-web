//UTILITIES
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
//API
import { userLimitedLogin } from "../../core/apis/authAPI";
import { getBundleById } from "../../core/apis/bundlesAPI";
//REDUCER
import {
  LimitedSignIn,
  LimitedSignOut,
} from "../../redux/reducers/authReducer";
//COMPONENT
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  FormCheckBox,
  FormInput,
} from "../../components/shared/form-components/FormComponents";
import { Button, Link, Skeleton } from "@mui/material";
import { StripePayment } from "../../components/stripe-payment/StripePayment";
import PaymentFlow from "../../components/payment/PaymentFlow";
import TmpLogin from "../../components/tmp-login/TmpLogin";
import { useTranslation } from "react-i18next";

const getEuroPrice = (displayPrice) => {
  const match = String(displayPrice).match(/[\d.]+/);
  const price = match ? parseFloat(match[0]) : 0;
  return (price).toFixed(2) + " EUR";
};

const getStripedFee = (displayPrice) => {
  const match = String(displayPrice).match(/[\d.]+/);
  const price = match ? parseFloat(match[0]) : 0;
  const fee = ((price) * 0.84173) * 0.012 + 0.25 / 0.84173;
  if (fee < 0.5) {
    return 0.5;
  }
  else 
    if (fee < 1) {
      return 1;
    }
    else
      if (fee < 1.5) {
        return 1.5;
      }
      else
        if (fee < 2) {
          return 2;
        }
        else
          if (fee < 2.5) {
            return 2.5 ;
          }
          else
            return 3;
};

const getTaxValue = (displayPrice) => {
  const match = String(displayPrice).match(/[\d.]+/);
  const price = match ? parseFloat(match[0]) : 0;
  const fee = getStripedFee(displayPrice);
  return ((price + fee) * 0.21).toFixed(2) + " EUR";
};

const getTaxedValue = (displayPrice) => {
  const match = String(displayPrice).match(/[\d.]+/);
  const price = match ? parseFloat(match[0]) : 0;
  const fee = getStripedFee(displayPrice);
  return (price + fee) * 0.21;
};

const getStripeFee = (displayPrice) => {
  const match = String(displayPrice).match(/[\d.]+/);
  const price = match ? parseFloat(match[0]) : 0;
  const fee = (((price) * 0.84173) * 0.012 + 0.25 / 0.84173).toFixed(2);
  if (fee < 0.5) {
    return "0.50 EUR";
  }
  else 
    if (fee < 1) {
      return "1.00 EUR";
    }
    else
      if (fee < 1.5) {
        return "1.50 EUR";
      }
      else
        if (fee < 2) {
          return "2.00 EUR";
        }
        else
          if (fee < 2.5) {
            return "2.50 EUR";
          }
          else
            return "3.00 EUR";
};

const getTotalValue = (displayPrice) => {
  const match = String(displayPrice).match(/[\d.]+/);
  const price = match ? parseFloat(match[0]) : 0;
  const tax = getTaxedValue(displayPrice);
  const fee = getStripedFee(displayPrice);
  return (price + tax + fee).toFixed(2) + " EUR";
};

const Checkout = () => {
  const { isAuthenticated, tmp } = useSelector((state) => state.authentication);
  const { login_type } = useSelector((state) => state.currency);
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();

  const { data, isLoading, error } = useQuery({
  queryKey: [`${id}-details`],
  queryFn: () =>
    getBundleById(id).then((res) => {
      const bundle = res?.data?.data;

      if (!bundle) return null;

      // Add derived values
      const fee = getStripeFee(bundle.price_display);
      const total = getTotalValue(bundle.price_display);

      return {
        ...bundle,
        processing_fee: fee,
        total_price: total,
      };
    }),
  enabled: !!id,
});

  const confirmed = useMemo(() => {
    return isAuthenticated || tmp?.isAuthenticated;
  }, [isAuthenticated, tmp]);

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
        ) : // :!data || error ? (
        //   <div className={"w-full sm:basis-[50%] items-center justify-center"}>
        //     <NoDataFound text={"Failed to load bunde checkout info"} />
        //   </div>)
        !confirmed ? (
          <TmpLogin />
        ) : (
          <PaymentFlow bundle={data} totalValue={getTotalValue(data?.price_display)} />

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
                {data?.display_title || t("common.notAvailable")}
              </p>
            </div>
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
                {getEuroPrice(data?.price_display)}
              </p>
            </div>
          <div
              className={
                "flex flex-row justify-between items-start gap-[1rem]"
              }
            >
              <label className={"flex-1 font-semibold"}>
                {t("checkout.fee")}
              </label>
              <p
                dir={"ltr"}
                className={`flex-1 font-bold text-right`}
              >
              {data?.processing_fee}
              </p>
            </div>
            <div
              className={
                "flex flex-row justify-between items-start gap-[1rem]"
              }
            >
              <label className={"flex-1 font-semibold"}>
                {t("checkout.tax")}
              </label>
              <p
                dir={"ltr"}
                className={`flex-1 font-bold text-right`}
              >
              {getTaxValue(data?.price_display)}
              </p>
            </div>
          <hr />
          <div
            className={"flex flex-row justify-between items-start gap-[1rem]"}
          >
            <label className={"font-semibold"}>{t("checkout.total")}</label>
            <p
              dir={"ltr"}
              className={`font-bold text-2xl text-right`}
            >
              {getTotalValue(data?.price_display)}
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
