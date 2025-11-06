import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Box,
  Chip,
} from "@mui/material";
import {
  CardGiftcard,
  MonetizationOn,
  LocalOffer,
  EmojiEvents,
  TrendingUp,
  Loyalty,
  ArrowForward,
  CheckCircle,
  Person,
  ShoppingCart,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { updateUserInfo } from "../../core/apis/authAPI";
import { UpdateAuthInfo } from "../../redux/reducers/authReducer";
import Container from "../../components/Container";

const Benefits = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user_info } = useSelector(
    (state) => state.authentication
  );
  const { 
    referral_amount, 
    user_currency, 
    system_currency,
    referred_discount_percentage
  } = useSelector(
    (state) => state.currency
  );

  const [isUpdating, setIsUpdating] = useState(false);
  const [shouldNotify, setShouldNotify] = useState(
    user_info?.should_notify || false
  );
  const [cashbackPercentage, setCashbackPercentage] = useState("5");

  const currency = user_currency?.currency || system_currency || "EUR";
  const referralReward = referral_amount || "10";
  const friendDiscount = referred_discount_percentage || "10";

  // Load cashback percentage from sessionStorage
  React.useEffect(() => {
    try {
      const configurations = sessionStorage.getItem("configurations");
      if (configurations) {
        const configObj = JSON.parse(configurations);
        const percentage = configObj.CASHBACK_PERCENTAGE || "5";
        setCashbackPercentage(percentage);
      }
    } catch (error) {
      console.error("Error loading cashback configuration:", error);
    }
  }, []);

  const handleToggleNotifications = async (checked) => {
    if (!isAuthenticated) {
      toast.info(t("benefits.signInToManagePreferences"));
      navigate("/signin");
      return;
    }

    setShouldNotify(checked);
    setIsUpdating(true);

    try {
      const payload = {
        should_notify: checked,
      };

      const res = await updateUserInfo(payload);
      const statusBool = res?.data?.status;

      if (statusBool) {
        dispatch(UpdateAuthInfo(res?.data?.data?.user_info));
        toast.success(
          checked
            ? t("benefits.promotionsEnabled")
            : t("benefits.promotionsDisabled")
        );
      } else {
        toast.error(t("benefits.failedToUpdatePreferences"));
        setShouldNotify(!checked); // Revert on failure
      }
    } catch (error) {
      toast.error(t("benefits.failedToUpdatePreferences"));
      setShouldNotify(!checked); // Revert on failure
    } finally {
      setIsUpdating(false);
    }
  };

  // Update local state when user_info changes
  React.useEffect(() => {
    if (user_info) {
      setShouldNotify(user_info.should_notify || false);
    }
  }, [user_info]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-secondary py-24">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=2000')] opacity-10 bg-cover bg-center" />
        
        <Container className="relative z-10">
          <div className="text-center text-white max-w-3xl mx-auto">
            <Chip
              icon={<EmojiEvents className="text-warning" />}
              label={t("benefits.exclusiveRewards")}
              className="mb-6 bg-white/20 backdrop-blur-sm text-white font-semibold"
              size="medium"
            />
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {t("benefits.heroTitle")}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Referral Program Card */}
          <Card
            className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-primary-600"
            sx={{ height: "100%" }}
          >
            <CardContent className="p-8 flex flex-col h-full">
              <div className="bg-gradient-to-br from-primary-100 to-primary-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <CardGiftcard className="text-primary-700 text-3xl" />
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-content-900">
                {t("benefits.referralProgram.title")}
              </h3>
              
              <div className="mb-6 flex-grow">
                <p className="text-content-600 mb-4 leading-relaxed">
                  {t("benefits.referralProgram.description")}
                </p>
                
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-4 rounded-xl mb-4">
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

                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-success mt-1 flex-shrink-0" fontSize="small" />
                    <span className="text-sm text-content-600">
                      {t("benefits.referralProgram.benefit1")}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-success mt-1 flex-shrink-0" fontSize="small" />
                    <span className="text-sm text-content-600">
                      {t("benefits.referralProgram.benefit2")}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-success mt-1 flex-shrink-0" fontSize="small" />
                    <span className="text-sm text-content-600">
                      {t("benefits.referralProgram.benefit3")}
                    </span>
                  </li>
                </ul>
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
              <div className="bg-gradient-to-br from-success-100 to-success-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MonetizationOn className="text-success text-3xl" />
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-content-900">
                {t("benefits.cashback.title")}
              </h3>
              
              <div className="mb-6 flex-grow">
                <p className="text-content-600 mb-4 leading-relaxed">
                  {t("benefits.cashback.description")}
                </p>

                <div className="bg-gradient-to-r from-success-50 to-warning-50 p-4 rounded-xl mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="text-success" />
                      <span className="text-sm font-semibold text-content-700">
                        {t("benefits.cashback.earnBack")}
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-success">
                      {cashbackPercentage}%
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

          {/* Promotions Card */}
          <Card
            className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-warning"
            sx={{ height: "100%" }}
          >
            <CardContent className="p-8 flex flex-col h-full">
              <div className="bg-gradient-to-br from-warning-100 to-warning-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <LocalOffer className="text-warning text-3xl" />
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-content-900">
                {t("benefits.promotions.title")}
              </h3>
              
              <div className="mb-6 flex-grow">
                <p className="text-content-600 mb-4 leading-relaxed">
                  {t("benefits.promotions.description")}
                </p>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-success mt-1 flex-shrink-0" fontSize="small" />
                    <span className="text-sm text-content-600">
                      {t("benefits.promotions.benefit1")}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-success mt-1 flex-shrink-0" fontSize="small" />
                    <span className="text-sm text-content-600">
                      {t("benefits.promotions.benefit2")}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-success mt-1 flex-shrink-0" fontSize="small" />
                    <span className="text-sm text-content-600">
                      {t("benefits.promotions.benefit3")}
                    </span>
                  </li>
                </ul>

                {isAuthenticated && (
                  <Box className="bg-gradient-to-r from-warning-50 to-primary-50 p-4 rounded-xl">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={shouldNotify}
                          onChange={(e) =>
                            handleToggleNotifications(e.target.checked)
                          }
                          disabled={isUpdating}
                          color="warning"
                        />
                      }
                      label={
                        <span className="text-sm font-medium text-content-800">
                          {shouldNotify
                            ? t("benefits.promotions.receiving")
                            : t("benefits.promotions.notReceiving")}
                        </span>
                      }
                    />
                  </Box>
                )}
              </div>

              {!isAuthenticated && (
                <Button
                  component={Link}
                  to="/signin"
                  variant="contained"
                  sx={{
                    bgcolor: "warning.main",
                    "&:hover": { bgcolor: "warning.dark" },
                  }}
                  fullWidth
                  endIcon={<ArrowForward />}
                  className="mt-4"
                >
                  {t("benefits.signUpForOffers")}
                </Button>
              )}
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
