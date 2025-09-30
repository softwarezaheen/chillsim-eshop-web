//UTILITIES
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "react-query";
import { useInView } from "react-intersection-observer";
//COMPONENTS
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Skeleton,
  Divider,
  Button 
} from "@mui/material";
import { 
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Redeem as RedeemIcon,
  ShoppingCart as ShoppingCartIcon,
  Undo as RefundIcon,
  People as ReferralIcon,
  MonetizationOn as CashbackIcon
} from "@mui/icons-material";
//API
import { getWalletTransactions } from "../../core/apis/walletAPI";
//SHARED COMPONENTS
import NoDataFound from "../shared/no-data-found/NoDataFound";

const WalletTransactions = () => {
  const { t } = useTranslation();
  const { ref, inView } = useInView();
  const pageSize = 10;

  const fetchTransactions = async ({ pageParam = 1 }) => {
    const { data } = await getWalletTransactions(pageParam, pageSize);
    return {
      data: data?.data || [],
      totalCount: data?.total_count || 0,
      page: pageParam,
    };
  };

  const {
    data: transactions,
    error,
    fetchNextPage,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["wallet-transactions"],
    queryFn: fetchTransactions,
    getNextPageParam: (lastPage) => {
      // Continue fetching if current page has full pageSize items
      return lastPage?.data?.length === pageSize ? lastPage?.page + 1 : undefined;
    },
    select: (data) => ({
      pages: data.pages,
      transactions: data.pages.flatMap((page) => page.data),
      totalCount: data.pages[0]?.totalCount || 0,
    }),
  });

  // Extract flattened transactions and total count
  const transactionsList = transactions?.transactions || [];
  const totalCount = transactions?.totalCount || 0;

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const getTransactionIcon = (type) => {
    switch (type) {
      case "top_up":
        return <TrendingUpIcon className="h-5 w-5 text-green-600" />;
      case "voucher_redeem":
        return <RedeemIcon className="h-5 w-5 text-blue-600" />;
      case "referral_reward":
        return <ReferralIcon className="h-5 w-5 text-purple-600" />;
      case "cashback":
        return <CashbackIcon className="h-5 w-5 text-orange-600" />;
      case "purchase":
        return <ShoppingCartIcon className="h-5 w-5 text-red-600" />;
      case "refund":
        return <RefundIcon className="h-5 w-5 text-blue-600" />;
      default:
        return <WalletIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      success: { color: "success", label: t("wallet.statusSuccess", "Success") },
      failed: { color: "error", label: t("wallet.statusFailed", "Failed") },
      pending: { color: "warning", label: t("wallet.statusPending", "Pending") },
    };

    const config = statusConfig[status] || { color: "default", label: status };
    return (
      <Chip 
        size="small" 
        color={config.color} 
        label={config.label}
        variant="outlined"
      />
    );
  };

  const getAmountColor = (amount) => {
    if (amount.startsWith("+")) return "text-green-600";
    if (amount.startsWith("-")) return "text-red-600";
    return "text-gray-800";
  };

  const formatDate = (timestamp) => {
    try {
      const date = new Date(parseInt(timestamp) * 1000);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return timestamp;
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton variant="text" width={200} height={32} />
            <Skeleton variant="text" width={100} height={24} />
          </div>
          {[...Array(5)].map((_, index) => (
            <div key={index} className="mb-4">
              <div className="flex items-center space-x-3 mb-2">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="flex-1">
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="40%" height={16} />
                </div>
                <Skeleton variant="text" width={80} height={20} />
              </div>
              <Divider />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6 text-center">
          <Typography variant="h6" color="error" className="mb-4">
            {t("wallet.failedToLoadTransactions", "Failed to load wallet transactions")}
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mb-4">
            {error?.message || t("common.somethingWentWrong", "Something went wrong")}
          </Typography>
          <Button
            onClick={() => window.location.reload()}
            variant="contained"
            color="primary"
          >
            {t("common.tryAgain", "Try Again")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Typography variant="h6" className="font-semibold">
            {t("wallet.transactionHistory", "Transaction History")}
          </Typography>
        </div>

        {transactionsList.length === 0 && !isLoading ? (
          <NoDataFound 
            text={t("wallet.noTransactionsYet", "No transactions yet")} 
          />
        ) : (
          <>
            <div className="space-y-4">
              {transactionsList.map((transaction) => (
                <div key={transaction.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-50 rounded-full flex-shrink-0">
                      {getTransactionIcon(transaction.transaction_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Mobile: Stack title and amount */}
                      <div className="sm:flex sm:items-center sm:justify-between">
                        <Typography variant="subtitle2" className="font-semibold text-gray-800 truncate">
                          {transaction.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          className={`font-bold ${getAmountColor(transaction.amount)} sm:ml-4`}
                        >
                          {transaction.amount}
                        </Typography>
                      </div>
                      <Typography variant="body2" color="text.secondary" className="truncate mt-1">
                        {transaction.description}
                      </Typography>
                      
                      {/* Mobile: Stack date and chips vertically */}
                      <div className="mt-3 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(transaction.date)}
                        </Typography>
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusChip(transaction.status)}
                          {transaction.voucher_code && (
                            <Chip 
                              size="small" 
                              label={`Code: ${transaction.voucher_code}`} 
                              variant="outlined"
                              color="info"
                            />
                          )}
                          {transaction.order_id && (
                            <Chip 
                              size="small" 
                              label={`Order: ${transaction.order_id.slice(-6)}`} 
                              variant="outlined"
                              color="default"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            
            {/* Infinite scroll trigger */}
            <div ref={ref} className="mt-4" />
            
            {/* Loading indicator for next page */}
            {isFetchingNextPage && !isLoading && (
              <div className="space-y-4 mt-4">
                {[...Array(3)].map((_, index) => (
                  <div key={`loading-${index}`} className="border-b border-gray-100 pb-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton variant="circular" width={40} height={40} />
                      <div className="flex-1">
                        <Skeleton variant="text" width="60%" height={20} />
                        <Skeleton variant="text" width="40%" height={16} />
                      </div>
                      <Skeleton variant="text" width={80} height={20} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletTransactions;