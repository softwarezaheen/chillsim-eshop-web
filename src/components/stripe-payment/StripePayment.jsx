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
import { useTranslation } from "react-i18next";

const schema = yup.object().shape({
  card: yup.string().nullable(),
});

export const StripePayment = (props) => {
  const { t } = useTranslation();
  const { stripePromise, clientSecret, orderDetail, loading } = props;

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
      <InjectedCheckout {...props} orderDetail={orderDetail} />
    </Elements>
  ) : (
    <div className={"flex flex-col gap-8 w-full sm:basis-[50%] shrink-0"}>
      <NoDataFound text={t("stripe.failedToLoadPaymentInputs")} />
    </div>
  );
};

const InjectedCheckout = ({ orderDetail }) => {
  const { t } = useTranslation();
  const { iccid } = useParams();
  const elements = useElements({ locale: localStorage.getItem("i18nextLng") });
  const stripe = useStripe();
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    if (!stripe || !elements) {
      toast.error(t("stripe.paymentProcessingError"));
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
            toast.error(result.error?.message);

            // Inform the customer that there was an error.
          } else {
            // Delay invalidation by 5 seconds
            setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: ["my-esim"] });
              if (iccid) {
                queryClient.invalidateQueries({
                  queryKey: [`esim-detail-${iccid}`],
                });
              }

              navigate({
                pathname: iccid ? `/esim/${iccid}` : "/plans",
                search: !iccid ? `?${searchParams.toString()}` : "",
              });
            }, 5000); // 5000 ms = 5 seconds
          }
        })
        .catch((error) => {
          toast.error(error?.message || t("stripe.paymentConfirmationFailed"));
        })
        .finally(() => setIsSubmitting(false));
    } catch (error) {
      toast.error(t("stripe.paymentConfirmationFailed"));
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
              dispatch(LimitedSignOut());
              navigate("/plans");
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
