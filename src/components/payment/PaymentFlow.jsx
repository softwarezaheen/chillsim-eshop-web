import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { StripePayment } from "../stripe-payment/StripePayment";
import { toast } from "react-toastify";
import OtpVerification from "../OtpVerification";
import { useParams, useNavigate } from "react-router-dom";
import {
  FormControlLabel,
  Radio,
  RadioGroup,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import { assignBundle, assignTopupBundle } from "../../core/apis/userAPI";
import { loadStripe } from "@stripe/stripe-js";
import WalletPayment from "../wallet/WalletPayment";
import {
  CustomToggleButton,
  CustomToggleGroup,
} from "../../assets/CustomComponents";
import { useTranslation } from "react-i18next";
import LoadingPayment from "./LoadingPayment";
import { queryClient } from "../../main";
import { fetchUserInfo } from "../../redux/reducers/authReducer";
import { clearReferral } from "../../redux/reducers/referralReducer";

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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { related_search } = useSelector((state) => state.search);
  const { user_info } = useSelector((state) => state.authentication);
  
  // Get referral discount state
  const { discountPercentage, referrerName, isEligible } = useSelector((state) => state.referral);
  const { login_type, system_currency, user_currency } = useSelector((state) => state.currency);
  const { allowed_payment_types } = useSelector((state) => state?.currency);
  const [clientSecret, setClientSecret] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  // const [orderDetail, setOrderDetail] = useState(null);
  const { orderDetail, setOrderDetail, promoCode = "", setIsWalletPaymentWithSufficientBalance } = props;
  const [loading, setLoading] = useState(false);

  // Helper functions for wallet balance
  const getWalletBalance = () => {
    return user_info?.balance || 
           user_info?.wallet_balance || 
           user_info?.account_balance || 
           user_info?.available_balance || 
           user_info?.credit_balance || 
           0;
  };

  const getCurrency = () => {
    const sessionCurrency = sessionStorage?.getItem("user_currency");
    return user_currency?.currency || 
           sessionCurrency ||
           user_info?.currency || 
           user_info?.default_currency ||
           system_currency || 
           "USD";
  };

  const formatCurrency = (amount, currencyCode) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      return `${amount.toFixed(2)} ${currencyCode}`;
    }
  };

  const getPaymentTypeLabel = (type) => {
    if (type?.toLowerCase() === "wallet") {
      const balance = getWalletBalance();
      const currency = getCurrency();
      return `${type} (${formatCurrency(balance, currency)})`;
    }
    return type;
  };

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

  const handleWalletPaymentSuccess = (orderData) => {
    toast.success(t("wallet.paymentSuccessful"));
    
    // Clear referral code after successful wallet payment
    dispatch(clearReferral());
    
    // Update user info to refresh wallet balance
    dispatch(fetchUserInfo());
    
    // Invalidate queries immediately
    queryClient.invalidateQueries({ queryKey: ["my-esim"] });
    if (iccid) {
      queryClient.invalidateQueries({
        queryKey: [`esim-detail-${iccid}`],
      });
    }

    // Add a small delay to ensure users see the processing modal before navigation
    setTimeout(() => {
      // Navigate with order_id parameter to trigger the same flow as card payments
      // Navigate to /plans/land for new orders (where PaymentCompletion modal exists)
      // or /esim/${iccid} for topups
      if (orderData?.order_id) {
        const targetPath = iccid ? `/esim/${iccid}` : "/plans/land";
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set("order_id", orderData.order_id);
        
        navigate({
          pathname: targetPath,
          search: searchParams.toString(),
        });
      } else {
        // Fallback if no order_id (shouldn't happen)
        navigate({
          pathname: iccid ? `/esim/${iccid}` : "/plans/land",
          search: !iccid ? new URLSearchParams(window.location.search).toString() : "",
        });
      }
    }, 2000); // 2 second delay to show processing modal
  };

  const assignMethod = () => {
    setLoading(true);

    // Debug logging
    console.log('assignMethod called with:', {
      bundle: props?.bundle,
      bundle_code: props?.bundle?.bundle_code,
      iccid: iccid,
      selectedType: selectedType,
      promoCode: promoCode
    });

    // Safety check: ensure bundle_code is available
    if (!props?.bundle?.bundle_code) {
      console.error('Bundle code is missing! Cannot proceed with assignment.');
      setLoading(false);
      toast.error('Bundle information is not available. Please try again.');
      return;
    }

    // Get referral code from localStorage if present
    const referredBy = localStorage.getItem("referred_by");

    let handleAPI = iccid ? assignTopupBundle : assignBundle;
    //this api is for creating a  payment intent to get client secret
    /*|| "cc3d8d05-6bcc-453e-b6a5-3204489907f3"*/
    handleAPI({
      bundle_code: props?.bundle?.bundle_code,
      payment_type: typeMap?.[selectedType.toLowerCase()],
      ...(!iccid ? { related_search: related_search } : { iccid: iccid }),
      promo_code: promoCode.toUpperCase(),
      referral_code: referredBy || "",
      affiliate_code: "",
    })
      .then((res) => {
        setOrderDetail(res?.data?.data);
        
        // Handle completed payment (100% discount or wallet payment)
        if (res?.data?.data?.payment_status === "COMPLETED") {
          handleWalletPaymentSuccess(res?.data?.data);
        } else if (selectedType !== "wallet") {
          // For non-wallet payments that require Stripe, set up stripe
          setClientSecret(res?.data?.data?.payment_intent_client_secret);
          setStripePromise(loadStripe(res?.data?.data?.publishable_key));
        }
        
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        toast?.error(e?.message || t("payment.failedToLoadPaymentInput"));
      });
  };

  useEffect(() => {
    if (selectedType && selectedType !== "wallet") {
      assignMethod();
    }
  }, [selectedType]);

  useEffect(() => {
    if (allowed_payment_types) {
      setSelectedType(allowed_payment_types?.[0]?.toLowerCase() || "dcb");
    }
  }, [allowed_payment_types]);

  // Track wallet payment status with sufficient balance
  useEffect(() => {
    if (setIsWalletPaymentWithSufficientBalance && selectedType && orderDetail) {
      const isWalletSelected = selectedType.toLowerCase() === "wallet";
      
      if (isWalletSelected) {
        const balance = getWalletBalance();
        const totalAmount = orderDetail?.total_amount || orderDetail?.amount || 0;
        const hasSufficientBalance = balance >= totalAmount;
        
        setIsWalletPaymentWithSufficientBalance(hasSufficientBalance);
      } else {
        setIsWalletPaymentWithSufficientBalance(false);
      }
    }
  }, [selectedType, orderDetail, setIsWalletPaymentWithSufficientBalance]);

  const Component = useMemo(() => {
    return selectedType
      ? allowed_payment_types?.length == 1
        ? ComponentMap?.[allowed_payment_types?.[0]?.toLowerCase()]
        : ComponentMap?.[selectedType?.toLowerCase()]
      : null;
  }, [allowed_payment_types, selectedType]);

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
                    key={type}
                    value={type?.toLowerCase()}
                    sx={{ 
                      width: type?.toLowerCase() === "wallet" ? "200px" : "150px",
                      fontSize: type?.toLowerCase() === "wallet" ? "0.875rem" : "1rem" 
                    }}
                  >
                    {getPaymentTypeLabel(type)}
                  </CustomToggleButton>
                ))}
              </CustomToggleGroup>
            )}
            
            {/* Stripe Security Disclaimer - Show only for card payment */}
            {selectedType?.toLowerCase() === "card" && (
              <div className="flex items-start gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                <svg 
                  className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-blue-800">
                  {t("stripe.securityDisclaimer")}{" "}
                  <a 
                    href="https://stripe.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-900 font-medium"
                  >
                    Stripe.com
                  </a>
                </p>
              </div>
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
