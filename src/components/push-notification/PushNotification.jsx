import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { onMessageListener, requestPermission } from "../../../firebaseconfig";
import { useNavigate } from "react-router-dom";
import { addDevice } from "../../core/apis/appAPI";
import { useDispatch, useSelector } from "react-redux";
import { AttachDevice } from "../../redux/reducers/deviceReducer";
import { Close } from "@mui/icons-material";
import { useNotifications } from "../../core/context/NotificationContext";

const PushNotification = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { refetch } = useNotifications();
  const [notification, setNotification] = useState({ title: "", body: "" });
  const notify = () => toast(<ToastDisplay />, { duration: 40000 });

  const { isAuthenticated } = useSelector((state) => state.authentication);
  const device = useSelector((state) => state.device); // Ensure `device` exists
  const authenticatedToken = device?.authenticated_fcm_token || null;
  const anonymousToken = device?.anonymous_fcm_token || null;
  const ToastDisplay = (toastElement) => (
    <div className="flex flex-col gap-[0.7rem] items-start w-full">
      <div
        className={
          "flex flex-row justify-between items-center w-full border-b border-content-600 pb-2"
        }
      >
        <div>
          <img src={"/logo/logo.png"} alt="LOGO" width={70} height={10} />
        </div>
        <Close
          fontSize="small"
          color="primary"
          className={"cursor-pointer"}
          onClick={() => toast.dismiss(toastElement?.id)}
        />
      </div>

      <div
        className={"flex flex-col gap-[0.5rem] cursor-pointer"}
        onClick={() => {
          if (notification?.iccid) {
            navigate(`/esim/${notification?.iccid}`);
          }
          toast.dismiss(toastElement?.id);
        }}
      >
        {" "}
        <h3>{notification?.title}</h3>
        <p className={"text-base text-content-600"}>{notification?.body}</p>
      </div>
    </div>
  );

  useEffect(() => {
    if (notification?.title) {
      notify();
      refetch();
    }
  }, [notification]);

  const registerDevice = (firebaseRes) => {
    addDevice({
      fcm_token: firebaseRes,
      manufacturer: navigator.vendor || "Unknown",
      device_model: navigator.userAgent,
      os: navigator.userAgentData?.platform,
      os_version: navigator.userAgentData?.platformVersion || "Unknown",
      app_version: navigator.appVersion,
      ram_size: navigator.deviceMemory
        ? `${navigator.deviceMemory} GB`
        : "Unknown",
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      is_rooted: true,
    }).then(() => {
      dispatch(
        AttachDevice({
          ...(isAuthenticated
            ? {
                authenticated_fcm_token: firebaseRes,
              }
            : {
                anonymous_fcm_token: firebaseRes,
              }),
          x_device_id: sessionStorage.getItem("x-device-id"),
        })
      );
    });
  };

  useEffect(() => {
    requestPermission().then((firebaseRes) => {
      if (
        (isAuthenticated && authenticatedToken) ||
        (!isAuthenticated && anonymousToken)
      )
        return;

      registerDevice(firebaseRes);
    });
  }, [isAuthenticated]);

  onMessageListener().then((payload) => {
    console.log("jjjjjjjjjjjjjjjjjjjjj1111");
    console.log(payload, "notificationnn payloadddd");
    setNotification({
      title: payload?.notification?.title,
      body: payload?.notification?.body,
      iccid: payload?.data?.iccid,
    });
  });
  return (
    <Toaster
      toastOptions={{
        style: {
          display: "flex",
          justifyContent: "flex-start",

          minWidth: "300px",
          wordBreak: "break-word",
        },
      }}
    />
  );
};

export default PushNotification;
