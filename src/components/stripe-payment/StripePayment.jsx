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

const schema = yup.object().shape({
  card: yup.string().nullable(),
});

export const StripePayment = (props) => {
  const { iccid } = useParams();
  const { related_search } = useSelector((state) => state.search);
  const [clientSecret, setClientSecret] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const related_search_test = {
    related_search: {
      region: null,
      countries: [
        {
          iso3_code: "AUT",
          country_name: "Austria",
        },
      ],
    },
  };
  useEffect(() => {
    setLoading(true);
    let handleAPI = iccid ? assignTopupBundle : assignBundle;
    //this api is for creating a  payment intent to get client secret
    /*|| "cc3d8d05-6bcc-453e-b6a5-3204489907f3"*/
    handleAPI({
      bundle_code: props?.bundle?.bundle_code,
      payment_type: "Card",
      ...(!iccid ? { related_search: related_search } : { iccid: iccid }),
      promo_code: "",
      referral_code: "",
      affiliate_code: "",
    })
      .then((res) => {
        console.log(res?.data?.data, "ORDER 11111");
        setOrderDetail(res?.data?.data);
        setClientSecret(res?.data?.data?.payment_intent_client_secret);
        setStripePromise(loadStripe(res?.data?.data?.publishable_key));
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        toast?.error(e?.message || "Failed to load payment input");
      });
  }, []);

  // Enable the skeleton loader UI for the optimal loading experience.
  const loader = "auto";

  return loading ? (
    <div className={"w-full sm:basis-[50%] shrink-0"}>
      <Skeleton variant="rectangular" height={150} />
    </div>
  ) : stripePromise && clientSecret ? (
    <Elements stripe={stripePromise} options={{ clientSecret, loader }}>
      <InjectedCheckout {...props} orderDetail={orderDetail} />
    </Elements>
  ) : (
    <div className={"flex flex-col gap-8 w-full sm:basis-[50%] shrink-0"}>
      <NoDataFound
        text={"Failed to load payment inputs. Please try again later"}
      />
    </div>
  );
};

const InjectedCheckout = ({ orderDetail }) => {
  const { iccid } = useParams();
  const elements = useElements();
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
      toast.error("Payment cannot be processed. Please contact IT support.");
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
            const queryKeys = ["my-esim"];
            if (iccid) {
              queryKeys.push(`esim-detail-${iccid}`);
            }

            queryClient.invalidateQueries({
              queryKey: queryKeys,
            });

            navigate({
              pathname: iccid ? `/esim/${iccid}` : "/plans",
              search: !iccid ? `?${searchParams.toString()}` : "",
            });
          }
        })
        .catch((error) => {
          toast.error(error?.message || "Failed to confirm payment");
        })
        .finally(() => setIsSubmitting(false));
    } catch (error) {
      toast.error("Failed to confirm payment");
      setIsSubmitting(false);
    }
  };

  const handleChange = (value) => {
    console.log(value);
  };

  return (
    <div className={"flex flex-col gap-8 w-full sm:basis-[50%] shrink-0"}>
      <h1>Payment Method</h1>

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
            Pay Now
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
            Cancel
          </Button>
        </div>
      </>
    </div>
  );
};

export default InjectedCheckout;
