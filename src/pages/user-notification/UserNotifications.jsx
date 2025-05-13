//UTILITIES
import React, { useEffect } from "react";
import { useInfiniteQuery } from "react-query";
import { useInView } from "react-intersection-observer";
import dayjs from "dayjs";
//COMPONENT
import { Card, CardContent, Skeleton } from "@mui/material";
import { getUserNotifications } from "../../core/apis/userAPI";
import NoDataFound from "../../components/shared/no-data-found/NoDataFound";
import { NoDataFoundSVG } from "../../assets/icons/Common";

const UserNotifications = () => {
  const { ref, inView } = useInView();

  const fetchNotifications = async ({ pageParam = 1 }) => {
    const { data } = await getUserNotifications({
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
    data: notifications,
    error,
    fetchNextPage,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["user-notifications-page"],
    queryFn: fetchNotifications,
    getNextPageParam: (lastPage) => {
      return lastPage?.totalCount < 20 ? undefined : lastPage?.page + 1;
    },

    select: (data) => data?.pages?.flatMap((page) => page.data),
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <div className={"flex flex-col gap-[1rem]"}>
      <h1>Notifications</h1>
      {isLoading ? (
        Array(4)
          .fill()
          ?.map((_, index) => (
            <Skeleton
              key={`notification-page-skeleton-${index}`}
              variant="rectangle"
              height={100}
              className={"rounded-md"}
            />
          ))
      ) : error || !notifications || notifications?.length === 0 ? (
        <NoDataFound
          text={error ? "Failed to load notifications" : "No notifications yet"}
          image={<NoDataFoundSVG />}
        />
      ) : (
        <>
          {notifications?.map((el, index) => (
            <Card key={index}>
              <CardContent className={"w-full flex flex-col gap-[0.5rem]"}>
                <div
                  className={
                    "flex flex-col items-start sm:flex-row sm:justify-between sm:items-center sm:gap-[1rem]"
                  }
                >
                  <h3 className="text-lg font-semibold  truncate min-w-0 w-full sm: flex-grow text-primary">
                    {el?.title}
                  </h3>
                  <div
                    className={
                      "text-sm text-content-600 font-semibold flex w-full sm:basis-[20%] justify-start sm:justify-end leading-none sm:leading-normal"
                    }
                  >
                    {dayjs.unix(el?.datetime).fromNow()}
                  </div>
                </div>

                <p>{el?.content}</p>
              </CardContent>
            </Card>
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
  );
};

export default UserNotifications;
