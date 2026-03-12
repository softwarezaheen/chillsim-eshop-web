//UTILITIES
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
//COMPONENTS
import {
  Card,
  CardContent,
  Button,
  IconButton,
  Tooltip,
  Skeleton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
const XIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622z" />
  </svg>
);
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import PeopleIcon from "@mui/icons-material/People";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import StarIcon from "@mui/icons-material/Star";
//SHARED COMPONENTS
import RewardsHistory from "../../components/referral/RewardsHistory";
import MilestoneProgress from "../../components/referral/MilestoneProgress";
import { getReferralProgress } from "../../core/apis/referralAPI";

/**
 * ReferralProgram Page
 * Main referral dashboard showing:
 * - Referral link with sharing options
 * - Rewards information
 * - Rewards history table
 */
const ReferralProgram = () => {
  const { t } = useTranslation();
  const { user_info } = useSelector((state) => state.authentication);
  const { 
    system_currency, 
    user_currency,
    referral_amount,
    referred_discount_percentage 
  } = useSelector((state) => state.currency);
  const [copied, setCopied] = useState(false);
  const [positionInCycle, setPositionInCycle] = useState(0);
  const [milestone5Bonus, setMilestone5Bonus] = useState("15");
  const [milestone10Bonus, setMilestone10Bonus] = useState("20");
  const [cycleSize, setCycleSize] = useState(10);

  const referralCode = user_info?.referral_code;
  const baseUrl = window.location.origin;
  const referralLink = `${baseUrl}/referral?referralCode=${referralCode}`;
  
  const currency = user_currency?.currency || system_currency || "EUR";
  const referralAmount = referral_amount || "10";
  const discountPercentage = referred_discount_percentage || "10";

  // Load config + referral progress on mount
  React.useEffect(() => {
    try {
      const configurations = sessionStorage.getItem("configurations");
      if (configurations) {
        const cfg = JSON.parse(configurations);
        setMilestone5Bonus(cfg.REFERRAL_MILESTONE_5_BONUS || "15");
        setMilestone10Bonus(cfg.REFERRAL_MILESTONE_10_BONUS || "20");
        setCycleSize(parseInt(cfg.REFERRAL_MILESTONE_CYCLE_SIZE, 10) || 10);
      }
    } catch (_) {}
    getReferralProgress()
      .then((res) => {
        if (res?.data?.data) {
          setPositionInCycle(res.data.data.position_in_cycle ?? 0);
        }
      })
      .catch(() => {});
  }, []);

  /**
   * Copy referral link to clipboard
   */
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success(t("referral.program.linkCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Share via Email
   */
  const handleEmailShare = () => {
    const subject = encodeURIComponent(
      t("referral.program.shareEmailSubject", {
        percentage: discountPercentage || "10",
      })
    );
    const body = encodeURIComponent(
      t("referral.program.shareEmailBody", {
        percentage: discountPercentage || "10",
        link: referralLink,
      })
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  /**
   * Share via WhatsApp
   */
  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      t("referral.program.shareWhatsappMessage", {
        percentage: discountPercentage || "10",
        link: referralLink,
      })
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  /**
   * Share via Facebook
   */
  const handleFacebookShare = () => {
    const url = encodeURIComponent(referralLink);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  /**
   * Share via X (Twitter)
   */
  const handleXShare = () => {
    const text = encodeURIComponent(
      t("referral.program.shareTwitterMessage", {
        percentage: discountPercentage || "10",
      })
    );
    const url = encodeURIComponent(referralLink);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  if (!user_info || !referralCode) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton variant="rectangular" height={300} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 max-w-6xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold">{t("nav.referAndEarn")}</h1>

      {/* Referral Information Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="bg-primary/10 p-2 sm:p-3 rounded-full">
              <CardGiftcardIcon className="text-primary" sx={{ fontSize: { xs: 24, sm: 32 } }} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold">{t("referral.program.earnRewards")}</h2>
          </div>

          {/* Rewards Explanation */}
          <div className="grid md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <CardGiftcardIcon className="text-primary" sx={{ fontSize: { xs: 20, sm: 28 } }} />
                <h3 className="font-bold text-sm sm:text-base">{t("referral.program.youGet")}</h3>
              </div>
              <p className="text-gray-700 text-xs sm:text-sm">
                {t("referral.program.youGetDescription", {
                  amount: referralAmount || "10",
                  currency: currency,
                })}
              </p>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <EmojiEventsIcon sx={{ fontSize: { xs: 20, sm: 28 }, color: "#906bae" }} />
                <h3 className="font-bold text-sm sm:text-base">{t("referral.program.milestonesTitle")}</h3>
              </div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  <StarIcon sx={{ fontSize: 13, color: "#906bae" }} />
                  {t("referral.program.milestone5Label")}
                </span>
                <span className="text-sm font-bold text-primary-700">+€{milestone5Bonus}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-1.5">
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  <EmojiEventsIcon sx={{ fontSize: 13, color: "#906bae" }} />
                  {t("referral.program.milestone10Label")}
                </span>
                <span className="text-sm font-bold text-primary-700">+€{milestone10Bonus}</span>
              </div>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <PeopleIcon className="text-secondary" sx={{ fontSize: { xs: 20, sm: 28 } }} />
                <h3 className="font-bold text-sm sm:text-base">{t("referral.program.friendGets")}</h3>
              </div>
              <p className="text-gray-700 text-xs sm:text-sm">
                {t("referral.program.friendGetsDescription", {
                  percentage: discountPercentage || "10",
                })}
              </p>
            </div>
          </div>

          {/* Referral Link Section */}
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm">
            <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">{t("referral.program.yourReferralLink")}</h3>
            
            {/* Link Display with Copy Button */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="flex-1 bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200 flex items-center">
                <p className="text-xs sm:text-sm font-mono truncate flex-1" dir="ltr">
                  {referralLink}
                </p>
                <Tooltip title={copied ? t("referral.program.copied") : t("referral.program.copyLink")}>
                  <IconButton
                    onClick={handleCopyLink}
                    color={copied ? "success" : "primary"}
                    size="small"
                  >
                    <ContentCopyIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                  </IconButton>
                </Tooltip>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-1 sm:gap-2">
              <p className="text-xs sm:text-sm font-semibold text-gray-600 flex items-center">
                <ShareIcon sx={{ fontSize: { xs: 16, sm: 20 } }} className="mr-1" />
                {t("referral.program.shareVia")}
              </p>
              <Tooltip title={t("referral.program.email")}>
                <IconButton
                  onClick={handleEmailShare}
                  size="small"
                  sx={{ 
                    color: "#EA4335",
                    padding: { xs: "6px", sm: "8px" }
                  }}
                >
                  <EmailIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("referral.program.whatsapp")}>
                <IconButton
                  onClick={handleWhatsAppShare}
                  size="small"
                  sx={{ 
                    color: "#25D366",
                    padding: { xs: "6px", sm: "8px" }
                  }}
                >
                  <WhatsAppIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("referral.program.facebook")}>
                <IconButton
                  onClick={handleFacebookShare}
                  size="small"
                  sx={{ 
                    color: "#1877F2",
                    padding: { xs: "6px", sm: "8px" }
                  }}
                >
                  <FacebookIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="X">
                <IconButton
                  onClick={handleXShare}
                  size="small"
                  sx={{ 
                    color: "#000000",
                    padding: { xs: "6px", sm: "8px" }
                  }}
                >
                  <XIcon size={20} />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestone Progress Section */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <EmojiEventsIcon className="text-primary" sx={{ fontSize: { xs: 20, sm: 28 } }} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">{t("referral.program.milestonesTitle")}</h2>
              <p className="text-xs text-gray-500">{t("referral.milestones.cycleLabel")}</p>
            </div>
          </div>

          <MilestoneProgress
            positionInCycle={positionInCycle}
            cycleSize={cycleSize}
            milestone5Bonus={milestone5Bonus}
            milestone10Bonus={milestone10Bonus}
            currency={currency}
            compact={false}
          />
        </CardContent>
      </Card>

      {/* Rewards History */}
      <RewardsHistory />
    </div>
  );
};

export default ReferralProgram;
