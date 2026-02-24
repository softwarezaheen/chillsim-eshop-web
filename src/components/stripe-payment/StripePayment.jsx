//UTILTIIES
import { loadStripe } from "@stripe/stripe-js";
import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
//API
import { assignBundle, assignTopupBundle } from "../../core/apis/userAPI";
//COMPONENT
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Button, Skeleton } from "@mui/material";
import NoDataFound from "../shared/no-data-found/NoDataFound";
import { queryClient } from "../../main";
import { LimitedSignOut } from "../../redux/reducers/authReducer";
import { clearReferral } from "../../redux/reducers/referralReducer";
import { useTranslation } from "react-i18next";

const schema = yup.object().shape({
  card: yup.string().nullable(),
});

export const StripePayment = (props) => {
  const { t } = useTranslation();
  const { stripePromise, clientSecret, orderDetail, loading, enableAutoTopup, autoTopupMonthlyCap, bundle, onError } = props;
  const { totalValue } = props;


  // Enable the skeleton loader UI for the optimal loading experience.
  const loader = "auto";

  return loading ? (
    <div className={"w-full sm:basis-[50%] shrink-0"}>
      <Skeleton variant="rectangular" height={150} />
    </div>
  ) : stripePromise && clientSecret ? (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        loader,
        locale: localStorage.getItem("i18nextLng"),
      }}
    >
      <InjectedCheckout {...props} orderDetail={orderDetail} enableAutoTopup={enableAutoTopup} autoTopupMonthlyCap={autoTopupMonthlyCap} bundle={bundle} onError={onError} onCancel={props.onCancel} />
    </Elements>
  ) : (
    <div className={"flex flex-col gap-8 w-full sm:basis-[50%] shrink-0"}>
      <NoDataFound text={t("stripe.failedToLoadPaymentInputs")} />
    </div>
  );
};

const InjectedCheckout = ({ orderDetail, enableAutoTopup, autoTopupMonthlyCap, bundle, onError, onCancel }) => {
  const { t } = useTranslation();
  const { iccid } = useParams();
  const elements = useElements({ locale: localStorage.getItem("i18nextLng") });
  const stripe = useStripe();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  console.log('💳 StripePayment InjectedCheckout props:', { enableAutoTopup, autoTopupMonthlyCap, iccid, bundleCode: bundle?.bundle_code });

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      card: "",
    },
    resolver: yupResolver(schema),
    mode: "all",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitForm = () => {
    // Clear any previous errors when retrying
    if (onError) {
      onError(null);
    }
    
    if (!stripe || !elements) {
      if (onError) {
        onError(t("stripe.paymentProcessingError"));
      } else {
        toast.error(t("stripe.paymentProcessingError"));
      }
      return;
    }
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("order_id", orderDetail?.order_id);
    try {
      setIsSubmitting(true);
      stripe
        .confirmPayment({
          elements,
          redirect: "if_required",
        })
        .then(function (result) {
          if (result.error) {
            if (onError) {
              onError(result.error?.message);
            } else {
              toast.error(result.error?.message);
            }

            // Inform the customer that there was an error.
          } else {
            // Clear referral code after successful payment
            dispatch(clearReferral());
            
            // Delay invalidation by 5 seconds
            setTimeout(() => {
              queryClient.removeQueries({ queryKey: ["my-esim"] });
              if (iccid) {
                queryClient.removeQueries({
                  queryKey: [`esim-detail-${iccid}`],
                });
              }

              // Navigate to /plans/land for new orders (where PaymentCompletion modal exists)
              // or /esim/${iccid} for topups (both with order_id in search params)
              navigate({
                pathname: iccid ? `/esim/${iccid}` : "/plans/land",
                search: searchParams.toString(),
              });
            }, 5000); // 5000 ms = 5 seconds
          }
        })
        .catch((error) => {
          if (onError) {
            onError(error?.message || t("stripe.paymentConfirmationFailed"));
          } else {
            toast.error(error?.message || t("stripe.paymentConfirmationFailed"));
          }
        })
        .finally(() => setIsSubmitting(false));
    } catch (error) {
      if (onError) {
        onError(t("stripe.paymentConfirmationFailed"));
      } else {
        toast.error(t("stripe.paymentConfirmationFailed"));
      }
      setIsSubmitting(false);
    }
  };

  const handleChange = (value) => {
    console.log(value);
  };

  return (
    <div className={"flex flex-col gap-8 w-full sm:basis-[50%] shrink-0"}>
      <>
        <PaymentElement id="payment-element" onChange={handleChange} />

        {/* Save payment method notice */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>{t("stripe.savePaymentNotice")}</span>
        </div>

        <div className={"flex flex-row gap-[0.5rem]"}>
          <Button
            color="secondary"
            variant="contained"
            sx={{ width: "60%" }}
            disabled={isSubmitting}
            onClick={() => handleSubmitForm()}
          >
            {t("btn.payNow")}
          </Button>
          <Button
            color="primary"
            variant="contained"
            sx={{ width: "60%" }}
            onClick={() => {
              if (onCancel) {
                onCancel();
              } else {
                dispatch(LimitedSignOut());
                navigate("/");
              }
            }}
          >
            {t("btn.cancel")}
          </Button>
        </div>
      </>
    </div>
  );
};

export default InjectedCheckout;
