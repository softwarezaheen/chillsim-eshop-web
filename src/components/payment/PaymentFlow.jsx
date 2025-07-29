import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { StripePayment } from "../stripe-payment/StripePayment";
import { toast } from "react-toastify";
import OtpVerification from "../OtpVerification";
import { useParams } from "react-router-dom";
import {
  FormControlLabel,
  Radio,
  RadioGroup,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { assignBundle, assignTopupBundle } from "../../core/apis/userAPI";
import { loadStripe } from "@stripe/stripe-js";
import WalletPayment from "../wallet/WalletPayment";
import {
  CustomToggleButton,
  CustomToggleGroup,
} from "../../assets/CustomComponents";
import { useTranslation } from "react-i18next";
import LoadingPayment from "./LoadingPayment";

const ComponentMap = {
  card: StripePayment,
  dcb: OtpVerification,
  otp: OtpVerification,
  wallet: WalletPayment,
  loading: LoadingPayment,
};

const typeMap = {
  card: "Card",
  dcb: "DCB",
  otp: "OTP",
  wallet: "Wallet",
};

const PaymentFlow = (props) => {
  const { t } = useTranslation();
  const { iccid } = useParams();
  const { related_search } = useSelector((state) => state.search);
  const { user_info } = useSelector((state) => state.authentication);
  const { login_type } = useSelector((state) => state.currency);
  const { allowed_payment_types } = useSelector((state) => state?.currency);
  const [clientSecret, setClientSecret] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
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

  const assignMethod = () => {
    setLoading(true);

    if (selectedType === "wallet") {
      toast.error(t("payment.paymentTypeNotAvailable"));
    } else {
      let handleAPI = iccid ? assignTopupBundle : assignBundle;
      //this api is for creating a  payment intent to get client secret
      /*|| "cc3d8d05-6bcc-453e-b6a5-3204489907f3"*/
      handleAPI({
        bundle_code: props?.bundle?.bundle_code,
        payment_type: typeMap?.[selectedType.toLowerCase()],
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
          toast?.error(e?.message || t("payment.failedToLoadPaymentInput"));
        });
    }
  };

  useEffect(() => {
    if (selectedType) {
      assignMethod();
    }
  }, [selectedType]);

  useEffect(() => {
    if (allowed_payment_types) {
      setSelectedType(allowed_payment_types?.[0]?.toLowerCase() || "dcb");
    }
  }, [allowed_payment_types]);

  console.log(allowed_payment_types, "allowed payment types");

  const Component = useMemo(() => {
    return selectedType
      ? allowed_payment_types?.length == 1
        ? ComponentMap?.[allowed_payment_types?.[0]?.toLowerCase()]
        : ComponentMap?.[selectedType?.toLowerCase()]
      : null;
  }, [allowed_payment_types, selectedType]);

  console.log(allowed_payment_types, selectedType, "check select type");

  return (
    <div className={"flex flex-col gap-2 w-full sm:basis-[50%] shrink-0"}>
      <h1>{t("payment.paymentMethod")}</h1>

      <div className={"flex flex-col gap-[1rem]"}>
        {selectedType ? (
          <div className={"flex flex-col gap-[0.5rem]"}>
            {allowed_payment_types?.length > 1 && (
              <CustomToggleGroup
                color="primary"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {allowed_payment_types?.map((type) => (
                  <CustomToggleButton
                    value={type?.toLowerCase()}
                    sx={{ width: "150px" }}
                  >
                    {type}
                  </CustomToggleButton>
                ))}
              </CustomToggleGroup>
            )}
            {Component && (
              <Component
                {...props}
                clientSecret={clientSecret}
                stripePromise={stripePromise}
                orderDetail={orderDetail}
                related_search={related_search}
                loading={loading}
                verifyBy={login_type == "phone" ? "sms" : "email"}
                phone={user_info?.phone}
                checkout={true}
                recallAssign={() => assignMethod()}
              />
            )}
          </div>
        ) : (
          <Skeleton />
        )}
      </div>
    </div>
  );
};

export default PaymentFlow;
