import React, { useEffect, useMemo, useState, useRef } from "react";
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
  CircularProgress,
  Button,
} from "@mui/material";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import { assignBundle, assignTopupBundle, getTaxes, getPaymentMethods } from "../../core/apis/userAPI";
import { loadStripe } from "@stripe/stripe-js";
import { useQuery } from "react-query";
import WalletPayment from "../wallet/WalletPayment";
import SavedPaymentMethodSelector from "./SavedPaymentMethodSelector";
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
  
  // Extract auto-topup props
  const { enableAutoTopup: shouldEnableAutoTopup, autoTopupMonthlyCap } = props;
  console.log('📝 PaymentFlow props:', { shouldEnableAutoTopup, autoTopupMonthlyCap, iccid, bundleCode: props?.bundle?.bundle_code });
  const { user_info } = useSelector((state) => state.authentication);
  
  // Get referral discount state
  const { discountPercentage, referrerName, isEligible } = useSelector((state) => state.referral);
  const { login_type, system_currency, user_currency } = useSelector((state) => state.currency);
  const { allowed_payment_types } = useSelector((state) => state?.currency);
  const [clientSecret, setClientSecret] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(null);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  // const [orderDetail, setOrderDetail] = useState(null);
  const { orderDetail, setOrderDetail, promoCode = "", setIsWalletPaymentWithSufficientBalance } = props;
  const [loading, setLoading] = useState(false);
  const [taxLoading, setTaxLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null); // Inline error message
  
  // Hard lock: set true when Pay Now is clicked, cleared only on error/cancel.
  // Unlike `loading`, this is never reset on success paths so the button stays
  // disabled during the navigation delay and cannot be double-submitted.
  const isPaying = useRef(false);
  const [isPayingState, setIsPayingState] = useState(false); // mirror for re-render
  const setIsPaying = (val) => { isPaying.current = val; setIsPayingState(val); };

  // Track if assign has been called for current payment method to prevent duplicate orders
  const assignCalledForRef = useRef(null);

  // Fetch saved payment methods
  const { data: paymentMethodsData } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => getPaymentMethods(),
    enabled: selectedType?.toLowerCase() === "card",
    refetchOnMount: "always", // Always fetch fresh data
    staleTime: 0, // Consider data stale immediately
  });

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
    // Only show wallet-specific toast for actual wallet payments
    // Saved payment methods navigate silently (like new card payments)
    if (selectedPaymentMethodId === 'wallet') {
      toast.success(t("wallet.paymentSuccessful"));
    }
    
    // Clear referral code after successful payment
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

  const handle3DSForSavedCard = async (paymentData) => {
    try {
      setLoading(true);
      setIsConfirmingPayment(true);
      
      const pmType = paymentData.payment_method_type || 'card';
      console.log('🔐 Starting authentication for saved payment method...', {
        payment_intent_client_secret: paymentData.payment_intent_client_secret?.substring(0, 20) + '...',
        payment_method_id: paymentData.payment_method_id,
        payment_method_type: pmType,
        order_id: paymentData.order_id,
      });
      
      // Load Stripe
      const stripe = await loadStripe(paymentData.publishable_key);
      if (!stripe) {
        throw new Error("Failed to load Stripe");
      }
      
      let paymentIntent, error;
      
      // Use different confirmation methods based on payment method type
      if (pmType === 'link') {
        // Link payment methods use confirmPayment (not confirmCardPayment)
        console.log('🔗 Using confirmPayment for Link payment method');
        const result = await stripe.confirmPayment({
          clientSecret: paymentData.payment_intent_client_secret,
          redirect: 'if_required',
          confirmParams: {
            return_url: window.location.href,
          },
        });
        paymentIntent = result.paymentIntent;
        error = result.error;
      } else {
        // Card and other payment methods use confirmCardPayment
        console.log('💳 Using confirmCardPayment for card payment method');
        const result = await stripe.confirmCardPayment(
          paymentData.payment_intent_client_secret,
          {
            payment_method: paymentData.payment_method_id, // Re-attach the payment method for 3DS
          }
        );
        paymentIntent = result.paymentIntent;
        error = result.error;
      }
      
      console.log('🔐 Confirmation result:', { 
        paymentIntent: paymentIntent ? {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        } : null,
        error: error ? {
          type: error.type,
          code: error.code,
          message: error.message,
        } : null,
      });
      
      // Check if error exists
      if (error) {
        console.error('❌ Authentication error detected:', error);
        setIsPaying(false);
        setLoading(false);
        setIsConfirmingPayment(false);
        setPaymentError(error.message || t("payment.authenticationFailed"));
        return;
      }
      
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded after authentication - navigate to success page
        console.log('✅ Authentication succeeded, payment completed');
        handleWalletPaymentSuccess({ order_id: paymentData.order_id });
      } else if (paymentIntent && paymentIntent.status === 'processing') {
        // Async payment method (SEPA Direct Debit, Sofort, etc.) — webhook will confirm
        console.log('⏳ Payment processing asynchronously — webhook will confirm');
        handleWalletPaymentSuccess({ order_id: paymentData.order_id });
      } else if (paymentIntent && paymentIntent.status === 'requires_payment_method') {
        // Authentication failed - customer failed authentication or canceled
        console.error('❌ Authentication failed - requires new payment method');
        setIsPaying(false);
        setLoading(false);
        setIsConfirmingPayment(false);
        setPaymentError(t("payment.authenticationFailed"));
      } else {
        // Unexpected status
        console.error('⚠️ Unexpected payment status:', paymentIntent?.status);
        setIsPaying(false);
        setLoading(false);
        setIsConfirmingPayment(false);
        setPaymentError(t("payment.failed") + ` (Status: ${paymentIntent?.status || 'unknown'})`);
      }
    } catch (err) {
      console.error("💥 Authentication exception:", err);
      setIsPaying(false);
      setLoading(false);
      setIsConfirmingPayment(false);
      setPaymentError(err.message || t("payment.authenticationFailed"));
    }
  };

  const assignMethod = () => {
    setIsPaying(true);
    setLoading(true);
    setIsConfirmingPayment(!!selectedPaymentMethodId); // Show confirming state for saved PMs
    setPaymentError(null); // Clear any previous errors

    // Debug logging
    console.log('🚀 assignMethod called with:', {
      bundle: props?.bundle,
      bundle_code: props?.bundle?.bundle_code,
      iccid: iccid,
      selectedType: selectedType,
      promoCode: promoCode,
      selectedPaymentMethodId: selectedPaymentMethodId,
      shouldEnableAutoTopup: shouldEnableAutoTopup,
      autoTopupMonthlyCap: autoTopupMonthlyCap
    });

    // Safety check: ensure bundle_code is available
    if (!props?.bundle?.bundle_code) {
      console.error('Bundle code is missing! Cannot proceed with assignment.');
      setIsPaying(false);
      setLoading(false);
      setIsConfirmingPayment(false);
      toast.error('Bundle information is not available. Please try again.');
      return;
    }

    // Get referral code from localStorage if present
    const referredBy = localStorage.getItem("referred_by");

    let handleAPI = iccid ? assignTopupBundle : assignBundle;
    
    // Determine payment type: use Wallet if wallet is selected from payment methods, otherwise use selectedType
    const effectivePaymentType = (selectedPaymentMethodId === 'wallet') ? 'Wallet' : typeMap?.[selectedType.toLowerCase()];
    
    // Build request payload
    const payload = {
      bundle_code: props?.bundle?.bundle_code,
      payment_type: effectivePaymentType,
      ...(!iccid ? { related_search: related_search } : { iccid: iccid }),
      promo_code: promoCode.toUpperCase(),
      referral_code: referredBy || "",
      affiliate_code: "",
      ...(iccid ? { enable_auto_topup: shouldEnableAutoTopup } : {}),
    };
    
    // Add payment_method_id ONLY for actual saved payment methods (pm_xxx, card_xxx, ba_xxx)
    // Do NOT send for 'new_card' or 'wallet' sentinel values
    if (selectedPaymentMethodId && selectedPaymentMethodId !== 'new_card' && selectedPaymentMethodId !== 'wallet' && selectedPaymentMethodId.startsWith('pm_')) {
      payload.payment_method_id = selectedPaymentMethodId;
    }
    
    //this api is for creating a  payment intent to get client secret
    /*|| "cc3d8d05-6bcc-453e-b6a5-3204489907f3"*/
    handleAPI(payload)
      .then((res) => {
        setOrderDetail(res?.data?.data);
        
        // Handle completed payment (100% discount, wallet payment, or successful saved PM payment)
        if (res?.data?.data?.payment_status === "COMPLETED") {
          // Leave loading/isConfirmingPayment=true — component navigates away, no need to reset
          // (resetting here would re-enable the Pay Now button during the 2s delay)
          handleWalletPaymentSuccess(res?.data?.data);
        } else if (res?.data?.data?.payment_status === "PENDING" && selectedPaymentMethodId && selectedPaymentMethodId !== 'new_card' && selectedPaymentMethodId !== 'wallet') {
          // Saved payment method requires 3DS - DON'T reset loading states, let handle3DSForSavedCard manage them
          handle3DSForSavedCard(res?.data?.data);
        } else if (effectivePaymentType !== "Wallet") {
          // For new card payments, set up stripe (isPaying stays true — user is still in checkout flow)
          setClientSecret(res?.data?.data?.payment_intent_client_secret);
          setStripePromise(loadStripe(res?.data?.data?.publishable_key));
          setLoading(false);
          setIsConfirmingPayment(false);
        } else {
          // Fallback — treat as error, let user retry
          setIsPaying(false);
          setLoading(false);
          setIsConfirmingPayment(false);
        }
      })
      .catch((e) => {
        setIsPaying(false);
        setLoading(false);
        setIsConfirmingPayment(false);
        toast?.error(e?.message || t("payment.failedToLoadPaymentInput"));
      });
  };

  // Auto-call assignMethod for non-card payment types (DCB, OTP, WALLET)
  useEffect(() => {
    if (selectedType && selectedType.toLowerCase() !== "card") {
      // For other payment types (dcb, otp, wallet), call immediately
      assignMethod();
    }
  }, [selectedType]);

  // Load tax information on mount to populate order summary (skip for wallet)
  useEffect(() => {
    const isWalletSelected = selectedType?.toLowerCase() === "wallet" || selectedPaymentMethodId === 'wallet';
    
    // Fetch taxes when:
    // 1. No orderDetail exists yet, OR
    // 2. OrderDetail exists but user is switching from wallet to non-wallet (need to replace wallet orderDetail with real tax data)
    const shouldFetchTaxes = props?.bundle?.bundle_code && !isWalletSelected && (
      !orderDetail || 
      (orderDetail && orderDetail.tax_mode === "none" && orderDetail.fee_enabled === false) // Indicates wallet orderDetail
    );
    
    if (shouldFetchTaxes) {
      setTaxLoading(true);
      getTaxes(props.bundle.bundle_code, promoCode || null)
        .then((res) => {
          setOrderDetail(res?.data?.data);
        })
        .catch((err) => {
          console.error("Failed to load tax information:", err);
        })
        .finally(() => {
          setTaxLoading(false);
        });
    }
  }, [props?.bundle?.bundle_code, promoCode, selectedType, selectedPaymentMethodId]);

  useEffect(() => {
    if (allowed_payment_types) {
      // Default to 'card' if available, otherwise first option
      const hasCard = allowed_payment_types.some(t => t.toLowerCase() === 'card');
      setSelectedType(hasCard ? 'card' : (allowed_payment_types?.[0]?.toLowerCase() || "dcb"));
    }
  }, [allowed_payment_types]);

  // Handle wallet-specific order details (no fees, no taxes, EUR only)
  useEffect(() => {
    const isWalletSelected = selectedType?.toLowerCase() === "wallet" || selectedPaymentMethodId === 'wallet';
    
    if (isWalletSelected && props?.bundle?.price) {
      // For wallet payments: use bundle price in EUR (default currency) with NO fees or taxes
      const bundlePriceInCents = Math.round(props.bundle.price * 100);
      const walletOrderDetail = {
        original_amount: bundlePriceInCents,
        total: bundlePriceInCents,
        fee: 0,
        vat: 0,
        currency: "EUR", // Wallet always in EUR (default currency)
        display_currency: "EUR",
        exchange_rate: 1,
        tax_mode: "none", // No tax for wallet
        fee_enabled: false
      };
      setOrderDetail(walletOrderDetail);
    }
  }, [selectedType, selectedPaymentMethodId, props?.bundle?.price]);

  // Track wallet payment status with sufficient balance
  useEffect(() => {
    if (setIsWalletPaymentWithSufficientBalance && orderDetail) {
      // Check if wallet is selected either as payment type OR from saved payment methods
      const isWalletSelected = selectedType?.toLowerCase() === "wallet" || selectedPaymentMethodId === 'wallet';
      
      if (isWalletSelected) {
        const balance = getWalletBalance();
        const totalAmount = orderDetail?.total / 100 || orderDetail?.total_amount || orderDetail?.amount || 0;
        const hasSufficientBalance = balance >= totalAmount;
        
        setIsWalletPaymentWithSufficientBalance(hasSufficientBalance);
      } else {
        setIsWalletPaymentWithSufficientBalance(false);
      }
    }
  }, [selectedType, selectedPaymentMethodId, orderDetail, setIsWalletPaymentWithSufficientBalance]);

  // Call assignMethod when "Pay with new card" is selected to load Stripe Elements
  useEffect(() => {
    // Reset tracking when payment method changes
    if (selectedPaymentMethodId !== assignCalledForRef.current) {
      assignCalledForRef.current = null;
    }
    
    if (selectedType?.toLowerCase() === "card" && 
        selectedPaymentMethodId === 'new_card' && 
        orderDetail && 
        !clientSecret && 
        !loading &&
        assignCalledForRef.current !== 'new_card') {
      // Mark that we've called assign for this payment method
      assignCalledForRef.current = 'new_card';
      assignMethod();
    }
  }, [selectedPaymentMethodId, orderDetail]);

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
            {/* Only show toggle for non-card, non-wallet payment types (DCB, OTP, etc.) */}
            {(() => {
              const otherPaymentTypes = allowed_payment_types?.filter(
                t => !['card', 'wallet'].includes(t.toLowerCase())
              ) || [];
              
              return otherPaymentTypes.length > 0 && allowed_payment_types.some(t => t.toLowerCase() === 'card') && (
                <CustomToggleGroup
                  color="primary"
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    // Reset payment method selection when changing payment type
                    setSelectedPaymentMethodId(null);
                    setClientSecret(null);
                  }}
                >
                  <CustomToggleButton
                    key="card"
                    value="card"
                    sx={{ width: "150px" }}
                  >
                    Card
                  </CustomToggleButton>
                  {otherPaymentTypes.map((type) => (
                    <CustomToggleButton
                      key={type}
                      value={type?.toLowerCase()}
                      sx={{ width: "150px" }}
                    >
                      {type}
                    </CustomToggleButton>
                  ))}
                </CustomToggleGroup>
              );
            })()}
            
            {/* Saved Payment Method Selector - Show for card payment */}
            {selectedType?.toLowerCase() === "card" && (
              <SavedPaymentMethodSelector
                selectedPaymentMethodId={selectedPaymentMethodId}
                onPaymentMethodChange={(methodId) => {
                  setSelectedPaymentMethodId(methodId);
                  // Reset client secret when changing payment method
                  setClientSecret(null);
                  // Clear any previous payment errors
                  setPaymentError(null);
                  // Release the payment lock so the button is active for the new selection
                  setIsPaying(false);
                }}
                showWalletOption={allowed_payment_types?.some(t => t.toLowerCase() === 'wallet')}
                walletBalance={getWalletBalance()}
                currency={getCurrency()}
                isWalletSufficient={getWalletBalance() >= (orderDetail?.total_amount || orderDetail?.amount || props?.bundle?.price || 0)}
                isLoading={isConfirmingPayment || taxLoading}
              />
            )}
            
            {/* Stripe Security Disclaimer - Show only for card payment when new card or saved PM selected (NOT wallet) */}
            {selectedType?.toLowerCase() === "card" && selectedPaymentMethodId && selectedPaymentMethodId !== 'wallet' && (
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
            
            {/* Only show payment component when payment method is selected (for card) or for other payment types */}
            {Component && (
              selectedType?.toLowerCase() !== "card" || (selectedType?.toLowerCase() === "card" && selectedPaymentMethodId === 'new_card')
            ) && (
              <>
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
                  enableAutoTopup={shouldEnableAutoTopup}
                  autoTopupMonthlyCap={autoTopupMonthlyCap}
                  onError={setPaymentError}
                  onCancel={() => {
                    setIsPaying(false);
                    setClientSecret(null);
                    setSelectedPaymentMethodId(null);
                    setPaymentError(null);
                    assignCalledForRef.current = null;
                  }}
                />
                
                {/* Error message display for new card payments */}
                {paymentError && (
                  <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-300 rounded-lg mt-3">
                    <svg 
                      className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-800 font-medium">{paymentError}</p>
                  </div>
                )}
              </>
            )}
            
            {/* Pay Now button for saved payment methods AND wallet */}
            {selectedType?.toLowerCase() === "card" && 
             selectedPaymentMethodId && 
             selectedPaymentMethodId !== 'new_card' && 
             !isConfirmingPayment && 
             !clientSecret && (
              <>
                {/* Show "no fees or taxes" message for wallet */}
                {selectedPaymentMethodId === 'wallet' && (
                  <div className="flex items-start gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                    <svg 
                      className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-green-800 font-medium">
                      {t("wallet.noFeesOrTaxes")}
                    </p>
                  </div>
                )}
                
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={assignMethod}
                  disabled={isPayingState || !orderDetail || (selectedPaymentMethodId === 'wallet' && getWalletBalance() < (orderDetail?.total / 100 || 0))}
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: '12px',
                  }}
                >
                  {isPayingState 
                    ? t("common.processing", "Processing...") 
                    : (() => {
                        if (!orderDetail) return "...";
                        // Get amount from orderDetail (all values in cents)
                        const amount = orderDetail.total || orderDetail.total_amount || orderDetail.original_amount || orderDetail.amount || 0;
                        const currency = orderDetail.currency || orderDetail.display_currency || "EUR";
                        const formattedAmount = formatCurrency(amount / 100, currency);
                        return t("wallet.payNowWithAmount", { amount: formattedAmount });
                      })()
                  }
                </Button>
                
                {/* Error message display */}
                {paymentError && (
                  <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-300 rounded-lg mt-3">
                    <svg 
                      className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-800 font-medium">{paymentError}</p>
                  </div>
                )}
              </>
            )}
            
            {/* Show loading state when confirming saved payment method OR processing wallet payment */}
            {selectedType?.toLowerCase() === "card" && selectedPaymentMethodId && selectedPaymentMethodId !== 'new_card' && isConfirmingPayment && (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <CircularProgress size={40} />
                <Typography variant="body2" color="textSecondary">
                  {selectedPaymentMethodId === 'wallet' 
                    ? t("wallet.processingPayment", "Processing Wallet Payment")
                    : t("payment.confirmingPayment")
                  }
                </Typography>
              </div>
            )}
            
            {/* Handle 3DS for saved payment methods (not for wallet) */}
            {selectedType?.toLowerCase() === "card" && selectedPaymentMethodId && selectedPaymentMethodId !== 'new_card' && selectedPaymentMethodId !== 'wallet' && clientSecret && !isConfirmingPayment && (
              <StripePayment
                {...props}
                clientSecret={clientSecret}
                stripePromise={stripePromise}
                orderDetail={orderDetail}
                related_search={related_search}
                loading={loading}
                checkout={true}
                recallAssign={() => assignMethod()}
                enableAutoTopup={shouldEnableAutoTopup}
                autoTopupMonthlyCap={autoTopupMonthlyCap}
                onError={setPaymentError}
                onCancel={() => {
                  setIsPaying(false);
                  setClientSecret(null);
                  setSelectedPaymentMethodId(null);
                  setPaymentError(null);
                  assignCalledForRef.current = null;
                }}
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
