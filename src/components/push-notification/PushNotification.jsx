import React, { useEffect, useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { onMessageListener, requestPermission } from "../../../firebaseconfig";
import { useNavigate } from "react-router-dom";
import { addDevice } from "../../core/apis/appAPI";
import { useDispatch, useSelector } from "react-redux";
import { AttachDevice } from "../../redux/reducers/deviceReducer";
import { Close } from "@mui/icons-material";
import { useNotifications } from "../../core/context/NotificationContext";
import { queryClient } from "../../main";

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
  
  // 🔥 Track previous auth state to detect logout
  const prevIsAuthenticatedRef = useRef(isAuthenticated);
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
    // 🔥 CRITICAL FIX: Detect authentication state transitions
    // Check BEFORE tokens are cleared/updated by Redux actions
    const wasAuthenticated = prevIsAuthenticatedRef.current;
    const isLoggingOut = wasAuthenticated && !isAuthenticated;
    const isLoggingIn = !wasAuthenticated && isAuthenticated;
    
    // Update ref for next render
    prevIsAuthenticatedRef.current = isAuthenticated;
    
    // Skip re-registration on logout (authenticated → anonymous)
    if (isLoggingOut) {
      console.info("🚫 User logged out - skipping device re-registration");
      return;
    }
    
    // Skip re-registration on login (anonymous → authenticated)
    // Login flows (OtpVerification, AuthContext) already handle device registration
    if (isLoggingIn) {
      console.info("🚫 User logged in - device already registered by login flow");
      return;
    }
    
    requestPermission().then((firebaseRes) => {
      // CRITICAL FIX: Don't register device without FCM token
      // This prevents devices with null tokens in production
      if (!firebaseRes) {
        console.warn("⚠️ No FCM token - device not registered");
        return;
      }

      // Get current token from Redux for this auth state
      const currentToken = isAuthenticated ? authenticatedToken : anonymousToken;
      
      // If token changed (user reset permissions or token refreshed), update backend
      // Firebase auto-refreshes tokens, so we need to detect and update
      if (currentToken && currentToken !== firebaseRes) {
        console.info("🔄 FCM token changed - updating backend");
        registerDevice(firebaseRes);
        return;
      }

      // Don't re-register if already have same token
      if (currentToken === firebaseRes) {
        console.info("✅ Already registered with current FCM token");
        return;
      }

      // New registration - no token yet (only for initial anonymous user)
      console.info("🆕 Registering new device with FCM token");
      registerDevice(firebaseRes);
    });
  }, [isAuthenticated]);

  onMessageListener().then((payload) => {
    console.log("jjjjjjjjjjjjjjjjjjjjj1111");
    console.log(payload, "notificationnn payloadddd");
    if (payload?.notification?.category == 2) {
      queryClient.invalidateQueries({ queryKey: ["my-esim"] });
      if (payload?.data?.iccid) {
        queryClient.invalidateQueries({
          queryKey: [`esim-detail-${payload?.data?.iccid}`],
        });
      }
    }
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
