import React, { useRef, useState, useEffect, useCallback } from "react";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { useTranslation } from "react-i18next";
import { useClickOutside } from "../core/custom-hook/useClickOutside";
import { markAsRead } from "../core/apis/userAPI";
import NoDataFound from "./shared/no-data-found/NoDataFound";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { Badge, Skeleton } from "@mui/material";
import { toast } from "react-toastify";
import { useNotifications } from "../core/context/NotificationContext";

const NotificationsMenuBody = () => {
  const { t } = useTranslation();
  const { notifications, refetch, checkUnread, isLoading, error } =
    useNotifications();

  const handleUnreadNotifications = useCallback(() => {
    markAsRead()
      .then((res) => {
        if (res?.data?.status === "success") {
          refetch();
        } else {
          toast.error(res?.message || "Failed to mark as unread");
        }
      })
      .catch((e) => {
        toast.error(e?.message || "Failed to mark as unread");
      });
  }, []);

  useEffect(() => {
    if (checkUnread) {
      handleUnreadNotifications();
    } else {
      refetch();
    }
  }, [checkUnread]);

  return (
    <div className="flex flex-col gap-[1rem] absolute right-0 mt-2 w-80 max-h-[400px] overflow-y-auto rounded-2xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-4">
      <div className={"flex flex-row justify-between items-center"}>
        <h3 className="text-lg font-semibold">{t("notifications.title")}</h3>
        {notifications?.length >= 1 && (
          <Link
            to={"/user-notifications"}
            className={"text-sm text-primary underline"}
          >
            {t("btn.view_more")}
          </Link>
        )}
      </div>
      {isLoading ? (
        Array(2)
          .fill()
          ?.map((el, index) => (
            <Skeleton
              className={"w-full"}
              key={`notification-skeleton-${index}`}
            />
          ))
      ) : !notifications || notifications?.length === 0 || error ? (
        <NoDataFound text={"No Notifications Found"} />
      ) : (
        <div className="space-y-4">
          {notifications?.map((notification, index) => (
            <div
              key={`notification-${notification.iccid}-${index}`}
              className={`w-full ${
                index !== notifications.length - 1
                  ? "border-b border-gray-100 pb-4"
                  : ""
              }`}
            >
              <h3 className={"truncate min-w-0"}>{notification.title}</h3>
              <p className="text-sm text-gray-900 mb-1 truncate min-w-0">
                {notification.content}
              </p>
              <p className="text-xs text-gray-500">
                {dayjs.unix(notification?.datetime).fromNow()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
const NotificationsMenu = () => {
  const { checkUnread } = useNotifications();
  const notificationWrapper = useRef(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  useClickOutside(notificationWrapper, () => setIsNotificationsOpen(false));

  return (
    <div className="relative" ref={notificationWrapper}>
      <button
        onClick={() => {
          setIsNotificationsOpen(!isNotificationsOpen);
        }}
        className="text-gray-700 hover:text-gray-900 bg-white  rounded p-1"
      >
        <Badge
          invisible={!checkUnread}
          color="secondary"
          variant="dot"
          overlap={"circular"}
        >
          <NotificationsNoneIcon
            className="h-5 w-5"
            color="primary"
            sx={{ color: "primary" }}
          />{" "}
        </Badge>
      </button>

      {isNotificationsOpen && <NotificationsMenuBody />}
    </div>
  );
};

export default NotificationsMenu;
