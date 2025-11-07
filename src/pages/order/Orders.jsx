//UTILITIES
import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useInfiniteQuery } from "react-query";
//COMPONENT
import Container from "../../components/Container";
import { Skeleton } from "@mui/material";
import { getOrdersHistory } from "../../core/apis/userAPI";
import NoDataFound from "../../components/shared/no-data-found/NoDataFound";
import { NoDataFoundSVG } from "../../assets/icons/Common";
import OrderCard from "../../components/order/OrderCard";
import PromotionsModal from "../../components/promotions/PromotionsModal";
import { usePromotionsPopup } from "../../core/custom-hook/usePromotionsPopup";
import { shouldShowPromotionsPopup } from "../../core/utils/authHelpers";

const Orders = () => {
  const { t } = useTranslation();
  const { ref, inView } = useInView();
  const authState = useSelector((state) => state.authentication);

  // Promotions popup hook - Smart height detection
  const {
    shouldShow: shouldShowPromotionsModal,
    dismissPopup: dismissPromotionsModal,
    remindLater: remindPromotionsLater,
    dontShowAgain: dontShowPromotionsAgain,
  } = usePromotionsPopup({
    enabled: shouldShowPromotionsPopup(authState),
    delaySeconds: 30,
    scrollThreshold: null, // Auto-detect based on page height
    useScrollTrigger: true,
    minTimeSeconds: 15, // Half of default delay
  });

  const fetchOrders = async ({ pageParam = 1 }) => {
    const { data } = await getOrdersHistory({
      page_index: pageParam,
      page_size: 20,
    });
    return {
      data: data?.data || [],
      totalCount: data?.totalCount,
      page: pageParam,
    };
  };

  const {
    data: orders,
    error,
    fetchNextPage,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["orders-history"],
    queryFn: fetchOrders,
    getNextPageParam: (lastPage) => {
      return lastPage?.data?.length == 20 ? lastPage?.page + 1 : undefined;
    },

    select: (data) => data.pages.flatMap((page) => page.data),
  });

  // const orders = [];

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <div className="flex flex-col gap-[2rem]">
      <div className="flex items-center justify-between gap-[2rem]">
        <h1 className="font-bold">{t("orders.orders_history")}</h1>
      </div>

      <div className={"flex flex-col gap-[1rem]"}>
        {isLoading ? (
          Array(4)
            .fill()
            ?.map((_, index) => (
              <Skeleton
                key={`order-skeleton-${index}`}
                variant="rectangle"
                height={100}
                className={"rounded-md"}
              />
            ))
        ) : error || !orders || orders?.length === 0 ? (
          <NoDataFound
            text={
              error ? t("orders.failedToLoadOrders") : t("orders.noOrdersYet")
            }
            image={<NoDataFoundSVG />}
          />
        ) : (
          <>
            {orders?.map((order, index) => (
              <OrderCard order={order} key={order?.order_number} />
            ))}
            <div ref={ref}></div>
            {isFetchingNextPage &&
              !isLoading &&
              Array(4)
                .fill()
                ?.map((skeleton) => (
                  <Skeleton
                    variant="rectangle"
                    height={100}
                    className={"rounded-md"}
                  />
                ))}
          </>
        )}
      </div>

      {/* Promotions Modal */}
      {shouldShowPromotionsModal && (
        <PromotionsModal
          open={shouldShowPromotionsModal}
          onClose={dismissPromotionsModal}
          onDismiss={dismissPromotionsModal}
          onRemindLater={remindPromotionsLater}
          onDontShowAgain={dontShowPromotionsAgain}
        />
      )}
    </div>
  );
};

export default Orders;
