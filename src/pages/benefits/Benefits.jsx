import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import {
  CardGiftcard,
  MonetizationOn,
  EmojiEvents,
  TrendingUp,
  Loyalty,
  ArrowForward,
  CheckCircle,
  Person,
  ShoppingCart,
  Star,
} from "@mui/icons-material";
import Container from "../../components/Container";
import MilestoneProgress from "../../components/referral/MilestoneProgress";
import { getReferralProgress, getCashbackTotal } from "../../core/apis/referralAPI";

const Benefits = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useSelector((state) => state.authentication);
  const { 
    referral_amount, 
    user_currency, 
    system_currency,
    referred_discount_percentage
  } = useSelector(
    (state) => state.currency
  );

  const [cashbackPercentage, setCashbackPercentage] = useState("5");
  const [cashbackTotal, setCashbackTotal] = useState(null);
  const [milestone5Bonus, setMilestone5Bonus] = useState("15");
  const [milestone10Bonus, setMilestone10Bonus] = useState("20");
  const [cycleSize, setCycleSize] = useState(10);
  const [positionInCycle, setPositionInCycle] = useState(0);

  const currency = user_currency?.currency || system_currency || "EUR";
  const referralReward = referral_amount || "10";
  const friendDiscount = referred_discount_percentage || "10";

  // Load config values from sessionStorage
  React.useEffect(() => {
    try {
      const configurations = sessionStorage.getItem("configurations");
      if (configurations) {
        const configObj = JSON.parse(configurations);
        setCashbackPercentage(configObj.CASHBACK_PERCENTAGE || "5");
        setMilestone5Bonus(configObj.REFERRAL_MILESTONE_5_BONUS || "15");
        setMilestone10Bonus(configObj.REFERRAL_MILESTONE_10_BONUS || "20");
        setCycleSize(parseInt(configObj.REFERRAL_MILESTONE_CYCLE_SIZE, 10) || 10);
      }
    } catch (error) {
      console.error("Error loading configuration:", error);
    }
  }, []);

  // Load referral progress when authenticated
  React.useEffect(() => {
    if (!isAuthenticated) return;
    getReferralProgress()
      .then((res) => {
        if (res?.data?.data) {
          setPositionInCycle(res.data.data.position_in_cycle ?? 0);
        }
      })
      .catch(() => {});
    getCashbackTotal()
      .then((res) => {
        if (res?.data?.data) {
          setCashbackTotal(res.data.data.total_cashback ?? 0);
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-secondary py-24">
        <div className="absolute inset-0 bg-[url('https://pub-c6956f461b54496d92df707e9f1b2fef.r2.dev/benefits/benefits_shutterstock_2621627227.jpg')] opacity-60 bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        
        <Container className="relative z-10">
          <div className="text-center text-white max-w-3xl mx-auto">
            <Chip
              icon={<EmojiEvents className="text-warning" />}
              label={t("benefits.exclusiveRewards")}
              className="mb-6 bg-white/20 backdrop-blur-sm text-white font-semibold"
              size="medium"
            />
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
              {t("benefits.heroTitle")}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white drop-shadow-md">
              {t("benefits.heroSubtitle")}
            </p>
            {!isAuthenticated && (
              <Button
                component={Link}
                to="/signin"
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.9)",
                    transform: "translateY(-2px)",
                    boxShadow: 4,
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {t("benefits.joinNow")}
              </Button>
            )}
          </div>
        </Container>
      </div>

      {/* Main Benefits Section */}
      <Container className="py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {/* Referral Program Card */}
          <Card
            className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-primary-600"
            sx={{ height: "100%" }}
          >
            <CardContent className="p-8 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-br from-primary-100 to-primary-50 w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <CardGiftcard className="text-primary-700 text-3xl" />
                </div>
                {isAuthenticated && (
                  <div className="flex-1">
                    <MilestoneProgress
                      positionInCycle={positionInCycle}
                      milestone5Bonus={milestone5Bonus}
                      milestone10Bonus={milestone10Bonus}
                      referralAmount={referralReward}
                      cycleSize={cycleSize}
                      currency={currency}
                      compact={true}
                    />
                  </div>
                )}
              </div>

              <h3 className="text-2xl font-bold mb-2 text-content-900">
                {t("benefits.referralProgram.inviteFriends")}
              </h3>
              <p className="text-content-500 text-sm mb-5 leading-relaxed">
                {t("benefits.referralProgram.shareText")}
              </p>

              <div className="mb-6 flex-grow">
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-4 rounded-xl mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-content-700">
                      {t("benefits.referralProgram.yourReward")}
                    </span>
                    <span className="text-2xl font-bold text-primary-700">
                      {referralReward} {currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-primary-200 pt-3">
                    <span className="text-sm font-semibold text-content-700">
                      {t("benefits.referralProgram.friendReward")}
                    </span>
                    <span className="text-2xl font-bold text-secondary">
                      {friendDiscount}% {t("benefits.referralProgram.off")}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-4 rounded-xl">
                  <p className="text-xs font-semibold text-content-500 uppercase tracking-wide mb-3">
                    🎯 {t("benefits.referralProgram.bonusMilestones")}
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-content-700">
                      <Star sx={{ fontSize: 14, color: "#906bae" }} />
                      {t("benefits.referralProgram.milestone5Label")}
                    </span>
                    <span className="font-bold text-primary-700">+€{milestone5Bonus}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-primary-200 pt-2">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-content-700">
                      <EmojiEvents sx={{ fontSize: 14, color: "#906bae" }} />
                      {t("benefits.referralProgram.milestone10Label")}
                    </span>
                    <span className="font-bold text-primary-700">+€{milestone10Bonus}</span>
                  </div>
                </div>
              </div>

              <Button
                component={Link}
                to={isAuthenticated ? "/referral-program" : "/signin"}
                variant="contained"
                color="primary"
                fullWidth
                endIcon={<ArrowForward />}
                className="mt-4"
              >
                {isAuthenticated
                  ? t("benefits.referralProgram.cta")
                  : t("benefits.signUpToRefer")}
              </Button>
            </CardContent>
          </Card>

          {/* Cashback Card */}
          <Card
            className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-success"
            sx={{ height: "100%" }}
          >
            <CardContent className="p-8 flex flex-col h-full">
              <div className="flex items-start justify-between mb-6">
                <div className="bg-gradient-to-br from-success-100 to-success-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MonetizationOn className="text-success text-3xl" />
                </div>
                {isAuthenticated && cashbackTotal !== null && cashbackTotal > 0 && (
                  <div className="bg-success rounded-xl px-3 py-2 text-right">
                    <p className="text-[0.65rem] text-green-100 font-medium uppercase tracking-wide leading-none mb-0.5">
                      {t("benefits.cashback.earned")}
                    </p>
                    <p className="text-lg font-bold text-white leading-none">
                      €{cashbackTotal.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              <h3 className="text-2xl font-bold mb-2 text-content-900">
                {t("benefits.cashback.title")}
              </h3>
              <p className="text-content-500 text-sm mb-5 leading-relaxed">
                {t("benefits.cashback.description")}
              </p>

              <div className="mb-6 flex-grow">
                <div className="bg-gradient-to-r from-success-50 to-warning-50 p-4 rounded-xl mb-5">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-success" />
                    <span className="text-sm font-semibold text-success">
                      {t("benefits.cashback.earnBack", { percentage: cashbackPercentage })}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-success mt-1 flex-shrink-0" fontSize="small" />
                    <span className="text-sm text-content-600">
                      {t("benefits.cashback.benefit1")}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-success mt-1 flex-shrink-0" fontSize="small" />
                    <span className="text-sm text-content-600">
                      {t("benefits.cashback.benefit2")}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-success mt-1 flex-shrink-0" fontSize="small" />
                    <span className="text-sm text-content-600">
                      {t("benefits.cashback.benefit3")}
                    </span>
                  </li>
                </ul>
                <p className="text-lg font-bold text-success mt-9 text-center tracking-wide">
                  {t("benefits.cashback.benefit4")}
                </p>
              </div>

              <Button
                component={Link}
                to={isAuthenticated ? "/wallet" : "/signin"}
                variant="contained"
                color="success"
                fullWidth
                endIcon={<ArrowForward />}
                className="mt-4"
              >
                {isAuthenticated
                  ? t("benefits.cashback.cta")
                  : t("benefits.signUpToSave")}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-12 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-content-900">
            {t("benefits.howItWorks.title")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Person className="text-primary-700 text-4xl" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-content-900">
                {t("benefits.howItWorks.step1Title")}
              </h3>
              <p className="text-content-600">
                {t("benefits.howItWorks.step1Description")}
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <ShoppingCart className="text-success text-4xl" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-content-900">
                {t("benefits.howItWorks.step2Title")}
              </h3>
              <p className="text-content-600">
                {t("benefits.howItWorks.step2Description")}
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Loyalty className="text-warning text-4xl" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-content-900">
                {t("benefits.howItWorks.step3Title")}
              </h3>
              <p className="text-content-600">
                {t("benefits.howItWorks.step3Description")}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-50 opacity-60" />
          
          <div className="relative text-center p-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-content-900">
              {t("benefits.cta.title")}
            </h2>
            <p className="text-xl mb-8 text-content-600 max-w-2xl mx-auto">
              {t("benefits.cta.subtitle")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                component={Link}
                to="/plans/land"
                variant="contained"
                color="primary"
                size="large"
                endIcon={<ShoppingCart />}
                sx={{
                  px: 5,
                  py: 2,
                  fontSize: "1.1rem",
                }}
              >
                {t("benefits.cta.browsePlans")}
              </Button>
              
              {isAuthenticated ? (
                <Button
                  component={Link}
                  to="/profile"
                  variant="outlined"
                  color="primary"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    px: 5,
                    py: 2,
                    fontSize: "1.1rem",
                  }}
                >
                  {t("benefits.cta.manageAccount")}
                </Button>
              ) : (
                <Button
                  component={Link}
                  to="/signin"
                  variant="contained"
                  color="secondary"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    px: 5,
                    py: 2,
                    fontSize: "1.1rem",
                  }}
                >
                  {t("benefits.cta.getStarted")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Benefits;
