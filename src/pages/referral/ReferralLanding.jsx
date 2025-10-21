//UTILITIES
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
//COMPONENTS
import {
  Button,
  Card,
  CardContent,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import WarningIcon from "@mui/icons-material/Warning";
import BlockIcon from "@mui/icons-material/Block";
//API
import { getReferralInfo } from "../../core/apis/referralAPI";
//REDUX
import { setReferralCode, validateReferralEligibility } from "../../redux/reducers/referralReducer";

/**
 * ReferralLanding Page
 * Displays when a visitor clicks on a referral link
 * Stores referral code in localStorage and shows welcome message
 */
const ReferralLanding = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("referralCode");

  // Get authentication state
  const { user_info } = useSelector((state) => state.authentication);
  const isAuthenticated = !!user_info;

  // State for edge case handling
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [existingReferral, setExistingReferral] = useState(null);
  const [isSelfReferral, setIsSelfReferral] = useState(false);
  const [shouldFetchReferralInfo, setShouldFetchReferralInfo] = useState(false); // Start as false, set to true only after edge case checks

  // Redirect if no referral code provided
  useEffect(() => {
    if (!referralCode) {
      navigate("/plans/land");
    }
  }, [referralCode, navigate]);

  /**
   * Edge Case Detection on Mount
   */
  useEffect(() => {
    if (!referralCode) return;

    // Check if user is trying to refer themselves
    if (isAuthenticated && user_info?.referral_code === referralCode) {
      setIsSelfReferral(true);
      setShouldFetchReferralInfo(false);
      return;
    }

    // Check if user already has a different referral code stored
    const storedReferral = localStorage.getItem("referred_by");
    if (storedReferral && storedReferral !== referralCode) {
      setExistingReferral(storedReferral);
      setShowOverrideDialog(true);
      setShouldFetchReferralInfo(false);
      return;
    }

    // If same referral code or no existing referral, proceed normally
    setShouldFetchReferralInfo(true);
  }, [referralCode, isAuthenticated, user_info]);

  // Fetch referral info from backend
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["referral-info", referralCode],
    queryFn: async () => {
      const response = await getReferralInfo(referralCode);
      return response?.data?.data;
    },
    enabled: !!referralCode && shouldFetchReferralInfo && !isSelfReferral,
    retry: false,
    onError: (error) => {
      // If referral code is invalid (404 or any error), redirect to plans
      navigate("/plans/land");
    },
    onSuccess: (data) => {
      // Store referral code in localStorage and Redux for later use during signup
      // Only store if not already stored (to prevent override issues)
      const currentStored = localStorage.getItem("referred_by");
      if (referralCode && data && currentStored !== referralCode) {
        localStorage.setItem("referred_by", referralCode);
        // Update Redux state with referral code
        dispatch(setReferralCode(referralCode));
        
        // If user is authenticated, validate eligibility immediately
        if (isAuthenticated) {
          dispatch(validateReferralEligibility(referralCode));
        }
      } else if (referralCode && data && currentStored === referralCode) {
        // Code already stored, just ensure Redux is in sync
        dispatch(setReferralCode(referralCode));
        
        // If user is authenticated, validate eligibility
        if (isAuthenticated) {
          dispatch(validateReferralEligibility(referralCode));
        }
      }
    },
  });

  /**
   * Handle Override Decision
   */
  const handleOverrideReferral = (override) => {
    if (override) {
      // User wants to use new referral code
      // First clear existing and close dialog
      setShowOverrideDialog(false);
      setExistingReferral(null);
      // Allow fetching
      setShouldFetchReferralInfo(true);
      // Manually trigger refetch which will store the new code in localStorage
      setTimeout(() => refetch(), 0);
    } else {
      // Keep existing referral, redirect to plans
      navigate("/plans/land");
    }
  };

  /**
   * Edge Case: Self-Referral (Block)
   */
  if (isSelfReferral) {
    return (
      <div className="flex flex-col gap-4 p-4 max-w-4xl mx-auto">
        <Card elevation={2}>
          <CardContent className="p-4 sm:p-6">
            <Alert severity="error" icon={<BlockIcon />} className="mb-4">
              <strong className="block mb-1">
                {t("referral.edge.selfReferralTitle")}
              </strong>
              <p className="text-sm">{t("referral.edge.selfReferralMessage")}</p>
            </Alert>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => navigate("/plans/land")}
            >
              {t("referral.landing.browsePlans")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Override Dialog (Multiple Referrals)
   */
  if (showOverrideDialog && existingReferral) {
    return (
      <Dialog
        open={showOverrideDialog}
        onClose={() => handleOverrideReferral(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="flex items-center gap-2">
          <WarningIcon color="warning" />
          {t("referral.edge.overrideTitle")}
        </DialogTitle>
        <DialogContent>
          <p className="text-sm text-gray-700 mb-4">
            {t("referral.edge.overrideMessage")}
          </p>
          <Alert severity="warning" className="text-sm">
            {t("referral.edge.overrideWarning")}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleOverrideReferral(false)} color="inherit">
            {t("referral.edge.keepExisting")}
          </Button>
          <Button
            onClick={() => handleOverrideReferral(true)}
            variant="contained"
            color="primary"
          >
            {t("referral.edge.useNew")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 max-w-4xl mx-auto">
        <Card elevation={2}>
          <CardContent className="p-4 sm:p-6">
            <Skeleton variant="text" height={40} width="80%" />
            <Skeleton variant="text" height={24} width="60%" className="mt-2" />
            <Skeleton variant="rectangular" height={120} className="mt-4 rounded-lg" />
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Skeleton variant="rectangular" height={40} className="flex-1 rounded" />
              <Skeleton variant="rectangular" height={40} className="flex-1 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return null; // Will redirect in useQuery onError
  }

  // Extract data from API response
  const discountPercentage = data?.percentage || "10";
  const referrerName = data?.referred_by || t("referral.landing.aFriend");
  const currency = data?.currency || "EUR";

  return (
    <div className="flex flex-col gap-4 p-4 max-w-4xl mx-auto">
      <Card elevation={2}>
        <CardContent className="p-4 sm:p-6">
          {/* Header Section */}
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <CardGiftcardIcon className="text-primary" sx={{ fontSize: 32 }} />
            </div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                {t("referral.landing.welcomeTitle")}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {t("referral.landing.referredByMessage", { 
                  referrerName: referrerName 
                })}
              </p>
            </div>
          </div>

          {/* Bonus Section */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <PersonAddIcon className="text-primary mt-1" sx={{ fontSize: 24 }} />
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-primary mb-2">
                  {t("referral.landing.yourBonus")}
                </h2>
                <p className="text-sm sm:text-base text-gray-700">
                  {t("referral.landing.bonusMessage", {
                    percentage: discountPercentage || "10",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="contained"
              color="primary"
              size="medium"
              fullWidth
              onClick={() => navigate("/plans/land")}
            >
              {t("referral.landing.browsePlans")}
            </Button>
            {/* Only show signup button if user is not authenticated */}
            {!isAuthenticated && (
              <Button
                variant="outlined"
                color="primary"
                size="medium"
                fullWidth
                onClick={() => navigate("/signin")}
              >
                {t("referral.landing.signUpNow")}
              </Button>
            )}
          </div>

          {/* Mobile App Tip */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-xs sm:text-sm text-blue-800">
              {t("referral.landing.mobileAppTip")}{" "}
              <strong className="font-bold text-blue-900">{referralCode}</strong>{" "}
              {t("referral.landing.atCheckout")}
            </p>
          </div>

          {/* Terms */}
          <p className="text-xs sm:text-sm text-gray-500 text-center mt-4">
            {t("referral.landing.termsApply")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralLanding;
