//UTILITIES
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "react-query";
import { useInView } from "react-intersection-observer";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
//COMPONENTS
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Skeleton,
  Tooltip,
} from "@mui/material";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PercentIcon from "@mui/icons-material/Percent";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CashbackIcon from "@mui/icons-material/Redeem";
//API
import { getPromotionUsageHistory } from "../../core/apis/referralAPI";
//SHARED
import NoDataFound from "../shared/no-data-found/NoDataFound";
import { NoDataFoundSVG } from "../../assets/icons/Common";

// Enable UTC plugin
dayjs.extend(utc);

/**
 * RewardsHistory Component
 * Displays a table of all referral rewards, discounts, and cashback
 * Supports infinite scroll pagination
 */
const RewardsHistory = () => {
  const { t } = useTranslation();
  const { ref, inView } = useInView();

  const fetchRewards = async ({ pageParam = 1 }) => {
    const { data } = await getPromotionUsageHistory({
      page_index: pageParam,
      page_size: 20,
    });
    return {
      data: data?.data || [],
      totalCount: data?.totalCount || 0,
      page: pageParam,
    };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["promotion-usage-history"],
    queryFn: fetchRewards,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.totalCount / 20);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const rewards = data?.pages?.flatMap((page) => page.data) || [];

  /**
   * Get icon based on reward_type (new field) or fallback to legacy is_referral
   */
  const getRewardTypeIcon = (reward) => {
    const rewardType = reward.reward_type || (reward.is_referral ? "referral_credit" : "promo_discount");
    
    switch (rewardType) {
      case "referral_credit":
        return <CardGiftcardIcon sx={{ fontSize: { xs: 18, sm: 20 } }} className="text-purple-600" />;
      case "promo_discount":
        return <LocalOfferIcon sx={{ fontSize: { xs: 18, sm: 20 } }} className="text-blue-600" />;
      case "cashback":
        return <CashbackIcon sx={{ fontSize: { xs: 18, sm: 20 } }} className="text-green-600" />;
      case "discount_amount":
        return <MonetizationOnIcon sx={{ fontSize: { xs: 18, sm: 20 } }} className="text-orange-600" />;
      case "discount_percentage":
        return <PercentIcon sx={{ fontSize: { xs: 18, sm: 20 } }} className="text-indigo-600" />;
      default:
        return <CardGiftcardIcon sx={{ fontSize: { xs: 18, sm: 20 } }} className="text-gray-600" />;
    }
  };

  /**
   * Get small icon for application_type (wallet credit vs order discount) to display before reward type
   */
  const getApplicationTypeIcon = (applicationType) => {
    if (!applicationType) return null;
    
    switch (applicationType) {
      case "wallet_credit":
        return (
          <Tooltip title={t("referral.appliedToWallet")}>
            <AccountBalanceWalletIcon sx={{ fontSize: { xs: 14, sm: 16 } }} className="text-green-600" />
          </Tooltip>
        );
      case "order_discount":
        return (
          <Tooltip title={t("referral.appliedToOrder")}>
            <ShoppingCartIcon sx={{ fontSize: { xs: 14, sm: 16 } }} className="text-blue-600" />
          </Tooltip>
        );
      default:
        return null;
    }
  };

  /**
   * Get color for reward type chip based on reward_type
   */
  const getTypeColor = (reward) => {
    const rewardType = reward.reward_type || (reward.is_referral ? "referral_credit" : "promo_discount");
    
    switch (rewardType) {
      case "referral_credit":
        return "secondary";
      case "promo_discount":
        return "primary";
      case "cashback":
        return "success";
      case "discount_amount":
        return "warning";
      case "discount_percentage":
        return "info";
      default:
        return "default";
    }
  };

  /**
   * Get translated label for reward type
   */
  const getRewardTypeLabel = (reward) => {
    const rewardType = reward.reward_type || (reward.is_referral ? "referral_credit" : "promo_discount");
    return t(`referral.rewardTypes.${rewardType}`, rewardType);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" height={40} />
          <Skeleton variant="rectangular" height={300} className="mt-4" />
        </CardContent>
      </Card>
    );
  }

  if (error || rewards.length === 0) {
    return (
      <Card>
        <CardContent>
          <h2 className="text-2xl font-bold mb-4">
            {t("referral.rewardsHistory")}
          </h2>
          <NoDataFound
            image={<NoDataFoundSVG />}
            text={t("referral.noRewardsYet")}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t("referral.rewardsHistory")}</h2>
        
        <TableContainer component={Paper} className="shadow-sm">
          <Table>
            <TableHead>
              <TableRow className="bg-gray-50">
                <TableCell className="font-bold text-xs sm:text-sm">{t("referral.date")}</TableCell>
                <TableCell className="font-bold text-xs sm:text-sm">{t("referral.type")}</TableCell>
                <TableCell className="font-bold text-xs sm:text-sm">{t("referral.description")}</TableCell>
                <TableCell align="right" className="font-bold text-xs sm:text-sm">
                  {t("referral.amount")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rewards.map((reward, index) => (
                <TableRow
                  key={`reward-${reward.id || index}`}
                  className="hover:bg-gray-50"
                >
                  <TableCell className="text-xs sm:text-sm">
                    {dayjs.unix(reward.date).format("DD MMM YYYY")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 sm:gap-2">
                      {getApplicationTypeIcon(reward.application_type)}
                      <span className="text-xs sm:text-sm font-medium">
                        {getRewardTypeLabel(reward)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-xs sm:text-sm">
                        {reward.title || reward.description || reward.name || t("referral.reward")}
                      </p>
                      {reward.description && reward.title && (
                        <p className="text-xs text-gray-500 mt-1">
                          {reward.description}
                        </p>
                      )}
                      {reward.referral_from && (
                        <p className="text-xs text-gray-500 mt-1">
                          {t("referral.from")}: {reward.referral_from}
                        </p>
                      )}
                      {reward.promotion_code && (
                        <p className="text-xs text-gray-500 mt-1">
                          {t("referral.code")}: {reward.promotion_code}
                        </p>
                      )}
                      {reward.bundle_name && (
                        <p className="text-xs text-gray-500 mt-1">
                          {t("referral.bundle")}: {reward.bundle_name}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell align="right">
                    <span className="font-semibold text-green-600 text-xs sm:text-sm">
                      {reward.amount}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Infinite scroll trigger */}
        <div ref={ref} className="mt-4" />

        {/* Loading indicator for next page */}
        {isFetchingNextPage && (
          <div className="flex justify-center mt-4">
            <Skeleton variant="rectangular" height={60} width="100%" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RewardsHistory;
