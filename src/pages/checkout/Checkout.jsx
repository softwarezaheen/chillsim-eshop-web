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
    queryFn: () => getBundleById(id).then((res) => res?.data?.data),
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
          <PaymentFlow bundle={data} />
        )}
        <div
          className={
            "bg-primary-50 p-4 rounded-2xl flex flex-col gap-8 w-full sm:basis-[50%] shadow-sm grow-0 min-w-0"
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
                className={`flex-1 font-bold truncate ${localStorage.getItem("i18nextLng") === "en" ? "text-right" : "text-left"}`}
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
                className={`flex-1 font-bold ${localStorage.getItem("i18nextLng") === "en" ? "text-right" : "text-left"}`}
              >
                {data?.price_display}
              </p>
            </div>
            <div
              className={"flex flex-row justify-between items-start gap-[1rem]"}
            >
              <label className={"flex-1 font-semibold"}>
                {t("checkout.estimatedTax")}
              </label>
              <p className={"flex-1 font-bold text-end"}>---</p>
            </div>
          </div>
          <hr />
          <div
            className={"flex flex-row justify-between items-start gap-[1rem]"}
          >
            <label className={"font-semibold"}>{t("checkout.total")}</label>
            <p
              dir={"ltr"}
              className={`font-bold text-2xl ${localStorage.getItem("i18nextLng") === "en" ? "text-right" : "text-left"}`}
            >
              {data?.price_display}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
