import { createContext, useContext, useEffect, useMemo } from "react";
import { getUserNotifications } from "../apis/userAPI";
import { useSelector } from "react-redux";
import { useQuery } from "react-query";

const NotificationContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.authentication);

  const {
    data: notifications,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user-notifications"],
    queryFn: () =>
      getUserNotifications({ page_index: 1, page_size: 10 }).then(
        (res) => res?.data?.data
      ),
    enabled: false,
  });

  const checkUnread = useMemo(() => {
    return notifications?.some((el) => el?.status == false);
  }, [notifications]);

  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    }
  }, [isAuthenticated]);

  return (
    <NotificationContext.Provider
      value={{
        refetch,
        error,
        notifications,
        isLoading,
        checkUnread,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
